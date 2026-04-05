import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthIdentity, requireAuthIdentity } from "./auth";

const sessionTypeValidator = v.union(
  v.literal("AUTO"),
  v.literal("POWER"),
  v.literal("POWER_ENDURANCE"),
  v.literal("TENSION_BOARD"),
  v.literal("COMPETITION"),
  v.literal("ENDURANCE"),
  v.literal("WORKOUT"),
  v.literal("FUN"),
  v.literal("CUSTOM")
);

const sessionStatusValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("COMPLETED"),
  v.literal("CANCELLED")
);

const competitionTypeValidator = v.union(
  v.literal("ONE_DAY_COMP"),
  v.literal("THREE_WEEK_COMP")
);

type SessionType =
  | "AUTO"
  | "POWER"
  | "POWER_ENDURANCE"
  | "TENSION_BOARD"
  | "COMPETITION"
  | "ENDURANCE"
  | "WORKOUT"
  | "FUN"
  | "CUSTOM";

type RouteReadModel = {
  id: string;
  title: string;
  color: string;
  grade: string;
  type: "BOULDER" | "ROPE";
  location: string;
  completed: boolean;
  setDate: string;
  completions: Array<{
    id: string;
    userId: string;
    routeId: string;
    completionDate: string;
    xpEarned: number;
    flash: boolean;
  }>;
  attempts: Array<{
    id: string;
    userId: string;
    routeId: string;
    attemptDate: string;
    attempts: number;
  }>;
  communityGrades: Array<{
    id: string;
    userId: string;
    routeId: string;
    grade: string;
  }>;
  bonusXp?: number | null;
  isArchive?: boolean;
  x?: number | null;
  y?: number | null;
  order?: number | null;
  isBounty?: boolean;
  bountyXp?: number | null;
  bountyStartedAt?: string | null;
};

type DashboardCompletion = {
  id: string;
  userId: string;
  routeId: string;
  completionDate: string;
  xpEarned: number;
  flash: boolean;
  route: {
    type: string;
    grade: string;
    title: string;
    color: string;
    id: string;
  };
};

type DashboardAttempt = {
  id: string;
  userId: string;
  routeId: string;
  attemptDate: string;
  attempts: number;
  route: {
    type: string;
    grade: string;
    title: string;
    color: string;
    id: string;
  };
};

type MobileSession = {
  id: string;
  userId: string;
  type: SessionType;
  name: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
  sessionDate: string;
  timeSlot: string | null;
  isRetroactive: boolean;
  isCompetition: boolean;
  competitionType: 'ONE_DAY_COMP' | 'THREE_WEEK_COMP' | null;
  competitionId: string | null;
  _count: {
    completions: number;
  };
};

export const getCurrentXp = query({
  args: {},
  handler: async ctx => {
    const user = await requireCurrentUser(ctx);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthly = await ctx.db
      .query("monthlyXp")
      .withIndex("by_user_year_month", q => q.eq("userId", user._id).eq("year", year).eq("month", month))
      .unique();

    return {
      xp: user.totalXp,
      monthlyXp: monthly?.xp ?? 0,
    };
  },
});

export const getAllRoutesNonArchive = query({
  args: {},
  handler: async (ctx): Promise<{ data: RouteReadModel[] }> => {
    const currentUser = await getCurrentUser(ctx);
    const routeDocs = await ctx.db.query("routes").take(10000);
    const activeRoutes = routeDocs.filter(route => !route.isArchived);
    const data = await Promise.all(activeRoutes.map(route => buildMobileRoute(ctx, route, currentUser?._id ?? null)));

    return { data };
  },
});

export const getRoutesByWall = query({
  args: { wall: v.string() },
  handler: async (ctx, args): Promise<{ data: RouteReadModel[] }> => {
    const wallDoc = await ctx.db
      .query("gymWalls")
      .withIndex("by_part_key", q => q.eq("partKey", args.wall))
      .unique();

    if (!wallDoc) {
      return { data: [] };
    }

    const currentUser = await getCurrentUser(ctx);
    const routeDocsByWall = await ctx.db
      .query("routes")
      .withIndex("by_wall", q => q.eq("gymWallId", wallDoc._id))
      .take(500);

    const routeDocs = routeDocsByWall.filter(route => !route.isArchived);
    const data = await Promise.all(routeDocs.map(route => buildMobileRoute(ctx, route, currentUser?._id ?? null)));

    return { data: sortRoutes(data) };
  },
});

export const searchRoutes = query({
  args: {
    text: v.string(),
    take: v.number(),
  },
  handler: async (ctx, args): Promise<{ data: RouteReadModel[] }> => {
    const currentUser = await getCurrentUser(ctx);
    const normalized = args.text.trim().toLowerCase();
    const routeDocs = await ctx.db.query("routes").take(10000);
    const filtered = routeDocs.filter(route => {
      if (!normalized) {
        return true;
      }

      return [route.title, route.color, route.grade, route.legacyLocationKey ?? ""]
        .some(value => value.toLowerCase().includes(normalized));
    });

    const data = await Promise.all(
      filtered.slice(0, Math.max(1, args.take)).map(route => buildMobileRoute(ctx, route, currentUser?._id ?? null))
    );

    return { data: data.sort((a, b) => Number(!!a.isArchive) - Number(!!b.isArchive)) };
  },
});

export const completeRoute = mutation({
  args: {
    routeId: v.string(),
    flash: v.boolean(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);

    if (!route) {
      throw new Error("Route not found");
    }

    const existingCompletions = await ctx.db
      .query("routeCompletions")
      .withIndex("by_user_route", q => q.eq("userId", user._id).eq("routeId", route._id))
      .take(100);

    const newHighestGrade = isNewHighestGrade(user, route.type, route.grade);
    const xpData = calculateCompletionXp(route.grade, existingCompletions.length, newHighestGrade, route.bonusXp ?? 0);

    const patch: Partial<Doc<"users">> = { totalXp: user.totalXp + xpData.xp };
    if (route.type === "ROPE" && isHigherGrade(user.highestRopeGrade ?? null, route.grade, route.type)) {
      patch.highestRopeGrade = route.grade;
    }
    if (route.type === "BOULDER" && isHigherGrade(user.highestBoulderGrade ?? null, route.grade, route.type)) {
      patch.highestBoulderGrade = route.grade;
    }
    await ctx.db.patch(user._id, patch);

    const completionDate = args.date ? new Date(args.date).getTime() : Date.now();
    const completionMonthDate = new Date(completionDate);
    const completionMonth = completionMonthDate.getMonth() + 1;
    const completionYear = completionMonthDate.getFullYear();
    const existingMonthlyXp = await ctx.db
      .query("monthlyXp")
      .withIndex("by_user_year_month", q =>
        q.eq("userId", user._id).eq("year", completionYear).eq("month", completionMonth)
      )
      .unique();

    if (existingMonthlyXp) {
      await ctx.db.patch(existingMonthlyXp._id, { xp: existingMonthlyXp.xp + xpData.xp });
    } else {
      await ctx.db.insert("monthlyXp", {
        userId: user._id,
        month: completionMonth,
        year: completionYear,
        xp: xpData.xp,
      });
    }

    await ctx.db.insert("routeCompletions", {
      userId: user._id,
      routeId: route._id,
      flash: args.flash,
      completionDate,
      xpEarned: xpData.xp,
      gradeSnapshot: {
        highestRopeGrade: patch.highestRopeGrade ?? user.highestRopeGrade,
        highestBoulderGrade: patch.highestBoulderGrade ?? user.highestBoulderGrade,
        totalXp: user.totalXp + xpData.xp,
      },
    });

    const activeSession = await getActiveSessionDoc(ctx, user._id);
    if (activeSession) {
      await ctx.db.patch(activeSession._id, { lastActivityAt: completionDate });
    }

    return { status: 200, xpEarned: xpData.xp };
  },
});

export const attemptRoute = mutation({
  args: { routeId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);

    if (!route) {
      throw new Error("Route not found");
    }

    const existing = await ctx.db
      .query("routeAttempts")
      .withIndex("by_user_route", q => q.eq("userId", user._id).eq("routeId", route._id))
      .unique();

    const attemptDate = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        attempts: existing.attempts + 1,
        attemptDate,
      });
    } else {
      await ctx.db.insert("routeAttempts", {
        userId: user._id,
        routeId: route._id,
        attempts: 1,
        attemptDate,
      });
    }

    const activeSession = await getActiveSessionDoc(ctx, user._id);
    if (activeSession) {
      await ctx.db.patch(activeSession._id, { lastActivityAt: attemptDate });
    }

    return { status: 200 };
  },
});

export const gradeRoute = mutation({
  args: {
    routeId: v.string(),
    selectedGrade: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);

    if (!route) {
      throw new Error("Route not found");
    }

    const existing = await ctx.db
      .query("communityGrades")
      .withIndex("by_user_route", q => q.eq("userId", user._id).eq("routeId", route._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        grade: args.selectedGrade,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("communityGrades", {
        userId: user._id,
        routeId: route._id,
        grade: args.selectedGrade,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { status: 200 };
  },
});

export const getDashboardCompletions = query({
  args: {},
  handler: async (ctx): Promise<{ data: DashboardCompletion[] }> => {
    const user = await requireCurrentUser(ctx);
    const rows = await ctx.db
      .query("routeCompletions")
      .withIndex("by_user_completion_date", q => q.eq("userId", user._id))
      .take(5000);

    const data = await Promise.all(
      rows.map(async row => {
        const route = await ctx.db.get(row.routeId);
        if (!route) {
          return null;
        }

        return {
          id: row.legacyPrismaId ?? row._id,
          userId: row.userId,
          routeId: row.routeId,
          completionDate: new Date(row.completionDate).toISOString(),
          xpEarned: row.xpEarned,
          flash: row.flash,
          route: {
            type: route.type,
            grade: route.grade,
            title: route.title,
            color: route.color,
            id: route.legacyPrismaId ?? route._id,
          },
        } satisfies DashboardCompletion;
      })
    );

    return {
      data: data
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()),
    };
  },
});

export const getDashboardAttempts = query({
  args: {},
  handler: async (ctx): Promise<{ data: DashboardAttempt[] }> => {
    const user = await requireCurrentUser(ctx);
    const rows = await ctx.db.query("routeAttempts").withIndex("by_user", q => q.eq("userId", user._id)).take(5000);

    const data = await Promise.all(
      rows.map(async row => {
        const route = await ctx.db.get(row.routeId);
        if (!route) {
          return null;
        }

        return {
          id: row.legacyPrismaId ?? row._id,
          userId: row.userId,
          routeId: row.routeId,
          attemptDate: new Date(row.attemptDate).toISOString(),
          attempts: row.attempts,
          route: {
            type: route.type,
            grade: route.grade,
            title: route.title,
            color: route.color,
            id: route.legacyPrismaId ?? route._id,
          },
        } satisfies DashboardAttempt;
      })
    );

    return {
      data: data
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()),
    };
  },
});

export const deleteCompletion = mutation({
  args: { completionId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const completion = await findCompletionByLegacyOrConvexId(ctx, args.completionId);
    if (!completion || completion.userId !== user._id) {
      throw new Error("Completion not found");
    }

    const route = await ctx.db.get(completion.routeId);
    const currentUser = await ctx.db.get(user._id);
    if (!route || !currentUser) {
      throw new Error("Missing route or user");
    }

    await ctx.db.delete(completion._id);

    const currentMonthDate = new Date(completion.completionDate);
    const month = currentMonthDate.getMonth() + 1;
    const year = currentMonthDate.getFullYear();
    const monthly = await ctx.db
      .query("monthlyXp")
      .withIndex("by_user_year_month", q => q.eq("userId", user._id).eq("year", year).eq("month", month))
      .unique();

    if (monthly) {
      await ctx.db.patch(monthly._id, { xp: Math.max(0, monthly.xp - completion.xpEarned) });
    }

    const remainingCompletions = await ctx.db
      .query("routeCompletions")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .take(5000);

    const routeIds = remainingCompletions.map(row => row.routeId);
    const routes = await Promise.all(routeIds.map(routeId => ctx.db.get(routeId)));
    const nextHighestRopeGrade = getHighestGrade(
      routes.filter((route): route is Doc<"routes"> => !!route && route.type === "ROPE").map(route => route.grade),
      "ROPE"
    );
    const nextHighestBoulderGrade = getHighestGrade(
      routes.filter((route): route is Doc<"routes"> => !!route && route.type === "BOULDER").map(route => route.grade),
      "BOULDER"
    );

    await ctx.db.patch(user._id, {
      totalXp: Math.max(0, currentUser.totalXp - completion.xpEarned),
      highestRopeGrade: nextHighestRopeGrade ?? undefined,
      highestBoulderGrade: nextHighestBoulderGrade ?? undefined,
    });

    return { ok: true };
  },
});

export const deleteAttempt = mutation({
  args: { attemptId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const attempt = await findAttemptByLegacyOrConvexId(ctx, args.attemptId);
    if (!attempt || attempt.userId !== user._id) {
      throw new Error("Attempt not found");
    }

    await ctx.db.delete(attempt._id);
    return { ok: true };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async ctx => {
    const currentUser = await getCurrentUser(ctx);
    const users = await ctx.db.query("users").take(10000);
    const publicUsers = users.filter(user => !user.private && user.totalXp > 0);
    const total = publicUsers
      .slice()
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 100)
      .map(user => ({
        id: user._id,
        name: user.name ?? null,
        username: user.username ?? null,
        image: user.image ?? null,
        totalXp: user.totalXp,
      }));

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const monthlyRows = await ctx.db
      .query("monthlyXp")
      .withIndex("by_year_month", q => q.eq("year", year).eq("month", month))
      .take(10000);

    const monthly = (
      await Promise.all(
        monthlyRows.map(async row => {
          const user = await ctx.db.get(row.userId);
          if (!user || user.private) {
            return null;
          }

          return {
            user: {
              id: user._id,
              name: user.name ?? null,
              username: user.username ?? null,
              image: user.image ?? null,
              totalXp: user.totalXp,
            },
            xp: row.xp,
          };
        })
      )
    )
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.xp - a.xp);

    const userTotalRank = currentUser ? total.findIndex(entry => entry.id === currentUser._id) + 1 || null : null;
    const userMonthlyRank = currentUser ? monthly.findIndex(entry => entry.user.id === currentUser._id) + 1 || null : null;

    return {
      monthly,
      total,
      userMonthlyRank,
      userTotalRank,
      currentMonth: today.toLocaleString("default", { month: "short" }),
    };
  },
});

export const getLeaderboardGradePoints = query({
  args: {
    type: v.union(v.literal("boulder"), v.literal("rope")),
    period: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const users = (await ctx.db.query("users").take(10000)).filter(user => !user.private);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const entries = (
      await Promise.all(
        users.map(async user => {
          const completions = await ctx.db
            .query("routeCompletions")
            .withIndex("by_user", q => q.eq("userId", user._id))
            .take(5000);

          const filtered = [] as Array<{ route: Doc<"routes">; completionDate: number }>;
          for (const completion of completions) {
            const route = await ctx.db.get(completion.routeId);
            if (!route) {
              continue;
            }
            if (args.type === "boulder" && route.type !== "BOULDER") {
              continue;
            }
            if (args.type === "rope" && route.type !== "ROPE") {
              continue;
            }

            if (args.period === "monthly") {
              const completionDate = new Date(completion.completionDate);
              if (completionDate.getFullYear() !== year || completionDate.getMonth() + 1 !== month) {
                continue;
              }
            }

            filtered.push({ route, completionDate: completion.completionDate });
          }

          if (filtered.length === 0) {
            return null;
          }

          const countsByGrade = new Map<string, number>();
          let gradePoints = 0;
          for (const item of filtered) {
            countsByGrade.set(item.route.grade, (countsByGrade.get(item.route.grade) ?? 0) + 1);
            gradePoints += getRouteXpValue(item.route.grade);
          }

          const topGrades = Array.from(countsByGrade.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([grade, count]) => ({ grade, count }));

          return {
            user: {
              id: user._id,
              name: user.name ?? null,
              username: user.username ?? null,
              image: user.image ?? null,
              totalXp: user.totalXp,
            },
            gradePoints,
            topGrades,
          };
        })
      )
    )
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.gradePoints - a.gradePoints)
      .slice(0, 100);

    return {
      entries,
      userRank: currentUser ? entries.findIndex(entry => entry.user.id === currentUser._id) + 1 || null : null,
      currentMonth: now.toLocaleString("default", { month: "short" }),
      period: args.period,
      type: args.type,
    };
  },
});

export const getPublicUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await findUserByLegacyOrConvexId(ctx, args.userId);
    if (!user || user.private) {
      throw new Error("Profile not found");
    }

    const completions = await ctx.db.query("routeCompletions").withIndex("by_user", q => q.eq("userId", user._id)).take(5000);
    const last5Completions = (
      await Promise.all(
        completions
          .sort((a, b) => b.completionDate - a.completionDate)
          .slice(0, 5)
          .map(async completion => {
            const route = await ctx.db.get(completion.routeId);
            if (!route) {
              return null;
            }

            return {
              grade: route.grade,
              title: route.title,
              color: route.color,
            };
          })
      )
    ).filter((row): row is NonNullable<typeof row> => row !== null);

    return {
      id: user._id,
      username: user.username ?? null,
      image: user.image ?? null,
      totalXp: user.totalXp,
      highestRopeGrade: user.highestRopeGrade ?? null,
      highestBoulderGrade: user.highestBoulderGrade ?? null,
      last5Completions,
    };
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx): Promise<{ data: MobileSession | null }> => {
    const user = await requireCurrentUser(ctx);
    const session = await getActiveSessionDoc(ctx, user._id);
    if (!session) {
      return { data: null };
    }

    return { data: await toMobileSession(ctx, session) };
  },
});

export const startSession = mutation({
  args: {
    type: sessionTypeValidator,
    name: v.optional(v.string()),
    startedAt: v.optional(v.string()),
    sessionDate: v.optional(v.string()),
    timeSlot: v.optional(v.string()),
    isRetroactive: v.optional(v.boolean()),
    isCompetition: v.optional(v.boolean()),
    competitionType: v.optional(competitionTypeValidator),
    competitionId: v.optional(v.string()),
    timezoneOffsetMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const existing = await getActiveSessionDoc(ctx, user._id);
    if (existing) {
      return { data: await toMobileSession(ctx, existing), message: "Session already active" };
    }

    const startedAt = args.startedAt ? new Date(args.startedAt).getTime() : Date.now();
    const sessionId = await ctx.db.insert("climbingSessions", {
      userId: user._id,
      type: args.type,
      name: args.name,
      status: "ACTIVE",
      startedAt,
      lastActivityAt: startedAt,
      sessionDate: args.sessionDate,
      timeSlot: args.timeSlot,
      isRetroactive: args.isRetroactive,
      isCompetition: args.isCompetition,
      competitionType: args.competitionType,
      competitionId: args.competitionId,
    });

    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Failed to create session");
    }

    return {
      data: await toMobileSession(ctx, session),
      message: "Session started",
    };
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.string(),
    type: v.optional(sessionTypeValidator),
    name: v.optional(v.string()),
    status: v.optional(sessionStatusValidator),
    endedAt: v.optional(v.string()),
    sessionDate: v.optional(v.string()),
    timeSlot: v.optional(v.string()),
    isRetroactive: v.optional(v.boolean()),
    isCompetition: v.optional(v.boolean()),
    competitionType: v.optional(competitionTypeValidator),
    competitionId: v.optional(v.string()),
    bumpActivity: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await findSessionById(ctx, args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    const patch: Partial<Doc<"climbingSessions">> = {};
    if (args.type !== undefined) patch.type = args.type;
    if (args.name !== undefined) patch.name = args.name;
    if (args.status !== undefined) patch.status = args.status;
    if (args.endedAt !== undefined) patch.endedAt = new Date(args.endedAt).getTime();
    if (args.sessionDate !== undefined) patch.sessionDate = args.sessionDate;
    if (args.timeSlot !== undefined) patch.timeSlot = args.timeSlot;
    if (args.isRetroactive !== undefined) patch.isRetroactive = args.isRetroactive;
    if (args.isCompetition !== undefined) patch.isCompetition = args.isCompetition;
    if (args.competitionType !== undefined) patch.competitionType = args.competitionType;
    if (args.competitionId !== undefined) patch.competitionId = args.competitionId;
    if (args.bumpActivity) patch.lastActivityAt = Date.now();
    if (args.status === "COMPLETED" && patch.endedAt === undefined) patch.endedAt = Date.now();

    await ctx.db.patch(session._id, patch);
    const updated = await ctx.db.get(session._id);
    if (!updated) {
      throw new Error("Failed to update session");
    }

    return {
      data: await toMobileSession(ctx, updated),
      message: "Session updated",
    };
  },
});

export const createRoute = mutation({
  args: {
    title: v.optional(v.string()),
    grade: v.string(),
    color: v.string(),
    location: v.string(),
    type: v.union(v.literal("BOULDER"), v.literal("ROPE")),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRouteEditor(user);
    const wall = await ctx.db.query("gymWalls").withIndex("by_part_key", q => q.eq("partKey", args.location)).unique();
    if (!wall) {
      throw new Error("Wall not found");
    }

    const existingRoutes = await ctx.db.query("routes").withIndex("by_wall", q => q.eq("gymWallId", wall._id)).take(200);
    const activeRoutes = existingRoutes.filter(route => !route.isArchived);
    const maxSortOrder = Math.max(-1, ...activeRoutes.map(route => route.sortOrder ?? -1));
    const routeId = await ctx.db.insert("routes", {
      gymId: wall.gymId,
      gymAreaId: wall.gymAreaId,
      gymZoneId: wall.gymZoneId,
      gymWallId: wall._id,
      title: args.title?.trim() || `${args.grade} ${args.type === "ROPE" ? "Route" : "Boulder"}`,
      color: args.color,
      grade: args.grade,
      type: args.type,
      setDate: Date.now(),
      isArchived: false,
      xp: getRouteXpValue(args.grade),
      bonusXp: isFeaturedGrade(args.grade) ? 200 : 0,
      x: args.x,
      y: args.y,
      sortOrder: maxSortOrder + 1,
      createdByUserId: user._id,
      legacyLocationKey: args.location,
    });

    const route = await ctx.db.get(routeId);
    if (!route) {
      throw new Error("Failed to create route");
    }

    return {
      data: {
        id: route.legacyPrismaId ?? route._id,
        title: route.title,
        grade: route.grade,
        color: route.color,
        type: route.type,
        location: args.location,
        x: route.x ?? null,
        y: route.y ?? null,
      },
    };
  },
});

export const updateRoute = mutation({
  args: {
    routeId: v.string(),
    newTitle: v.optional(v.string()),
    newType: v.optional(v.union(v.literal("BOULDER"), v.literal("ROPE"))),
    newGrade: v.optional(v.string()),
    newDate: v.optional(v.union(v.number(), v.null())),
    newLocation: v.optional(v.string()),
    newX: v.optional(v.union(v.number(), v.null())),
    newY: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRouteEditor(user);
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const patch: Partial<Doc<"routes">> = {};
    if (args.newTitle !== undefined) patch.title = args.newTitle;
    if (args.newType !== undefined) patch.type = args.newType;
    if (args.newGrade !== undefined) {
      patch.grade = args.newGrade;
      patch.xp = getRouteXpValue(args.newGrade);
      patch.bonusXp = isFeaturedGrade(args.newGrade) ? 200 : 0;
    }
    if (args.newDate !== undefined) patch.setDate = args.newDate ?? route.setDate;
    if (args.newX !== undefined) patch.x = args.newX ?? undefined;
    if (args.newY !== undefined) patch.y = args.newY ?? undefined;
    if (args.newLocation !== undefined) {
      patch.legacyLocationKey = args.newLocation;
      const wall = await ctx.db
        .query("gymWalls")
        .withIndex("by_part_key", q => q.eq("partKey", args.newLocation as string))
        .unique();
      if (wall) {
        patch.gymId = wall.gymId;
        patch.gymAreaId = wall.gymAreaId;
        patch.gymZoneId = wall.gymZoneId;
        patch.gymWallId = wall._id;
      }
    }

    await ctx.db.patch(route._id, patch);
    return { ok: true };
  },
});

export const archiveRoute = mutation({
  args: { routeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRouteEditor(user);
    let updatedCount = 0;
    for (const routeId of args.routeIds) {
      const route = await findRouteByLegacyOrConvexId(ctx, routeId);
      if (!route) continue;
      await ctx.db.patch(route._id, { isArchived: true });
      updatedCount += 1;
    }
    return { message: `Archived ${updatedCount} route(s)` };
  },
});

export const deleteRoute = mutation({
  args: { routeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRouteEditor(user);
    let deletedCount = 0;

    for (const routeId of args.routeIds) {
      const route = await findRouteByLegacyOrConvexId(ctx, routeId);
      if (!route) {
        continue;
      }

      const completions = await ctx.db.query("routeCompletions").withIndex("by_route", q => q.eq("routeId", route._id)).take(5000);
      const attempts = await ctx.db.query("routeAttempts").withIndex("by_route", q => q.eq("routeId", route._id)).take(5000);
      const grades = await ctx.db.query("communityGrades").withIndex("by_route", q => q.eq("routeId", route._id)).take(5000);
      const images = await ctx.db.query("routeImages").withIndex("by_route", q => q.eq("routeId", route._id)).take(100);
      const bounties = await ctx.db.query("routeBounties").withIndex("by_route", q => q.eq("routeId", route._id)).take(100);

      for (const row of completions) await ctx.db.delete(row._id);
      for (const row of attempts) await ctx.db.delete(row._id);
      for (const row of grades) await ctx.db.delete(row._id);
      for (const row of images) await ctx.db.delete(row._id);
      for (const row of bounties) await ctx.db.delete(row._id);
      await ctx.db.delete(route._id);
      deletedCount += 1;
    }

    return { message: `Deleted ${deletedCount} route(s)` };
  },
});

export const getRouteBountyStatus = query({
  args: { routeId: v.string() },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const activeBounty = await ctx.db
      .query("routeBounties")
      .withIndex("by_route_and_active", q => q.eq("routeId", route._id).eq("isActive", true))
      .unique();

    return {
      hasActiveBounty: !!activeBounty,
      activeBounty: activeBounty
        ? { id: activeBounty._id, startedAt: new Date(activeBounty.startedAt).toISOString() }
        : null,
    };
  },
});

export const addManualBounty = mutation({
  args: { routeId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireAdmin(user);
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const existing = await ctx.db
      .query("routeBounties")
      .withIndex("by_route_and_active", q => q.eq("routeId", route._id).eq("isActive", true))
      .unique();
    if (existing) {
      throw new Error("Route already has an active bounty");
    }

    await ctx.db.insert("routeBounties", {
      routeId: route._id,
      createdByUserId: user._id,
      isActive: true,
      startedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const runManualBountyFill = mutation({
  args: {},
  handler: async ctx => {
    const user = await requireCurrentUser(ctx);
    requireAdmin(user);

    const routes = (await ctx.db.query("routes").take(10000)).filter(route => !route.isArchived);
    const activeBounties = await ctx.db.query("routeBounties").take(1000);
    const activeRouteIds = new Set(activeBounties.filter(bounty => bounty.isActive).map(bounty => bounty.routeId));

    const ropeRoutes = routes.filter(route => route.type === "ROPE" && !activeRouteIds.has(route._id));
    const boulderRoutes = routes.filter(route => route.type === "BOULDER" && !activeRouteIds.has(route._id));
    const currentActiveRope = routes.filter(route => route.type === "ROPE" && activeRouteIds.has(route._id)).length;
    const currentActiveBoulder = routes.filter(route => route.type === "BOULDER" && activeRouteIds.has(route._id)).length;
    const ropeTarget = 3;
    const boulderTarget = 3;

    let ropeCreated = 0;
    let boulderCreated = 0;

    for (const route of ropeRoutes.slice(0, Math.max(0, ropeTarget - currentActiveRope))) {
      await ctx.db.insert("routeBounties", {
        routeId: route._id,
        createdByUserId: user._id,
        isActive: true,
        startedAt: Date.now(),
      });
      ropeCreated += 1;
    }

    for (const route of boulderRoutes.slice(0, Math.max(0, boulderTarget - currentActiveBoulder))) {
      await ctx.db.insert("routeBounties", {
        routeId: route._id,
        createdByUserId: user._id,
        isActive: true,
        startedAt: Date.now(),
      });
      boulderCreated += 1;
    }

    return {
      createdCount: ropeCreated + boulderCreated,
      rope: {
        createdCount: ropeCreated,
        activeCount: currentActiveRope + ropeCreated,
        targetCount: ropeTarget,
      },
      boulder: {
        createdCount: boulderCreated,
        activeCount: currentActiveBoulder + boulderCreated,
        targetCount: boulderTarget,
      },
    };
  },
});

async function getCurrentUser(ctx: QueryCtx) {
  const identity = await getAuthIdentity(ctx);
  if (!identity) {
    return null;
  }

  return await findUserByIdentity(ctx, identity.tokenIdentifier, identity.subject, identity.email);
}

async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuthIdentity(ctx);
  const user = await findUserByIdentity(ctx, identity.tokenIdentifier, identity.subject, identity.email);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

async function findUserByIdentity(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  subject: string,
  email: string | null
) {
  const byToken = await ctx.db
    .query("users")
    .withIndex("by_clerk_token_identifier", q => q.eq("clerkTokenIdentifier", tokenIdentifier))
    .unique();
  if (byToken) {
    return byToken;
  }

  const bySubject = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", subject)).unique();
  if (bySubject) {
    return bySubject;
  }

  if (!email) {
    return null;
  }

  return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", email)).unique();
}

async function buildMobileRoute(
  ctx: QueryCtx,
  route: Doc<"routes">,
  viewerUserId: Id<"users"> | null
): Promise<RouteReadModel> {
  const location = await resolveLocationForRoute(ctx, route);
  const communityGrades = await getCommunityGrades(ctx, route._id);
  const completions = viewerUserId ? await getRouteCompletionsForUser(ctx, route._id, viewerUserId) : [];
  const attempts = viewerUserId ? await getRouteAttemptsForUser(ctx, route._id, viewerUserId) : [];
  const activeBounty = await ctx.db
    .query("routeBounties")
    .withIndex("by_route_and_active", q => q.eq("routeId", route._id).eq("isActive", true))
    .unique();

  return {
    id: route.legacyPrismaId ?? route._id,
    title: route.title,
    color: route.color,
    grade: route.grade,
    type: route.type,
    location,
    completed: completions.length > 0,
    setDate: new Date(route.setDate).toISOString(),
    completions,
    attempts,
    communityGrades,
    bonusXp: route.bonusXp ?? 0,
    isArchive: route.isArchived,
    x: route.x ?? null,
    y: route.y ?? null,
    order: route.sortOrder ?? null,
    isBounty: !!activeBounty,
    bountyXp: activeBounty ? 50 : null,
    bountyStartedAt: activeBounty ? new Date(activeBounty.startedAt).toISOString() : null,
  };
}

async function getRouteCompletionsForUser(ctx: QueryCtx, routeId: Id<"routes">, userId: Id<"users">) {
  const rows = await ctx.db
    .query("routeCompletions")
    .withIndex("by_user_route", q => q.eq("userId", userId).eq("routeId", routeId))
    .take(20);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    completionDate: new Date(row.completionDate).toISOString(),
    xpEarned: row.xpEarned,
    flash: row.flash,
  }));
}

async function getRouteAttemptsForUser(ctx: QueryCtx, routeId: Id<"routes">, userId: Id<"users">) {
  const rows = await ctx.db
    .query("routeAttempts")
    .withIndex("by_user_route", q => q.eq("userId", userId).eq("routeId", routeId))
    .take(20);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    attemptDate: new Date(row.attemptDate).toISOString(),
    attempts: row.attempts,
  }));
}

async function getCommunityGrades(ctx: QueryCtx, routeId: Id<"routes">) {
  const rows = await ctx.db.query("communityGrades").withIndex("by_route", q => q.eq("routeId", routeId)).take(50);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    grade: row.grade,
  }));
}

async function resolveLocationForRoute(ctx: QueryCtx | MutationCtx, route: Doc<"routes">) {
  if (route.gymWallId) {
    const wall = await ctx.db.get(route.gymWallId);
    if (wall) {
      return wall.partKey;
    }
  }
  return route.legacyLocationKey ?? "unknown";
}

async function findRouteByLegacyOrConvexId(ctx: QueryCtx | MutationCtx, routeId: string) {
  const byLegacy = await ctx.db.query("routes").withIndex("by_legacy_prisma_id", q => q.eq("legacyPrismaId", routeId)).unique();
  if (byLegacy) {
    return byLegacy;
  }

  try {
    return await ctx.db.get(routeId as Id<"routes">);
  } catch {
    return null;
  }
}

async function findCompletionByLegacyOrConvexId(ctx: QueryCtx | MutationCtx, completionId: string) {
  const byLegacy = await ctx.db
    .query("routeCompletions")
    .withIndex("by_legacy_prisma_id", q => q.eq("legacyPrismaId", completionId))
    .unique();
  if (byLegacy) {
    return byLegacy;
  }

  try {
    return await ctx.db.get(completionId as Id<"routeCompletions">);
  } catch {
    return null;
  }
}

async function findAttemptByLegacyOrConvexId(ctx: QueryCtx | MutationCtx, attemptId: string) {
  const byLegacy = await ctx.db
    .query("routeAttempts")
    .withIndex("by_legacy_prisma_id", q => q.eq("legacyPrismaId", attemptId))
    .unique();
  if (byLegacy) {
    return byLegacy;
  }

  try {
    return await ctx.db.get(attemptId as Id<"routeAttempts">);
  } catch {
    return null;
  }
}

async function findUserByLegacyOrConvexId(ctx: QueryCtx, userId: string) {
  try {
    return await ctx.db.get(userId as Id<"users">);
  } catch {
    return null;
  }
}

async function getActiveSessionDoc(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("climbingSessions")
    .withIndex("by_user_and_status", q => q.eq("userId", userId).eq("status", "ACTIVE"))
    .unique();
}

async function findSessionById(ctx: QueryCtx | MutationCtx, sessionId: string) {
  try {
    return await ctx.db.get(sessionId as Id<"climbingSessions">);
  } catch {
    return null;
  }
}

async function toMobileSession(ctx: QueryCtx | MutationCtx, session: Doc<"climbingSessions">): Promise<MobileSession> {
  const completions = await ctx.db.query("routeCompletions").withIndex("by_user", q => q.eq("userId", session.userId)).take(5000);
  const completionCount = completions.filter(row => row.completionDate >= session.startedAt).length;

  return {
    id: session._id,
    userId: session.userId,
    type: session.type,
    name: session.name ?? null,
    status: session.status,
    startedAt: new Date(session.startedAt).toISOString(),
    endedAt: session.endedAt ? new Date(session.endedAt).toISOString() : null,
    lastActivityAt: new Date(session.lastActivityAt).toISOString(),
    sessionDate: session.sessionDate ?? new Date(session.startedAt).toISOString().slice(0, 10),
    timeSlot: session.timeSlot ?? null,
    isRetroactive: !!session.isRetroactive,
    isCompetition: !!session.isCompetition,
    competitionType: session.competitionType ?? null,
    competitionId: session.competitionId ?? null,
    _count: {
      completions: completionCount,
    },
  };
}

function sortRoutes(routes: RouteReadModel[]) {
  return routes.sort((a, b) => {
    const ax = typeof a.x === "number" ? a.x : Number.POSITIVE_INFINITY;
    const bx = typeof b.x === "number" ? b.x : Number.POSITIVE_INFINITY;
    if (ax !== bx) {
      return ax - bx;
    }

    const ay = typeof a.y === "number" ? a.y : Number.POSITIVE_INFINITY;
    const by = typeof b.y === "number" ? b.y : Number.POSITIVE_INFINITY;
    if (ay !== by) {
      return ay - by;
    }

    const aOrder = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
    const bOrder = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return a.title.localeCompare(b.title);
  });
}

function requireRouteEditor(user: Doc<"users">) {
  if (user.role !== "ADMIN" && user.role !== "ROUTE_SETTER") {
    throw new Error("Unauthorized");
  }
}

function requireAdmin(user: Doc<"users">) {
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function isFeaturedGrade(grade: string) {
  const normalized = grade.toLowerCase();
  return normalized === "vfeature" || normalized === "5.feature" || normalized === "competition";
}

function calculateCompletionXp(
  grade: string,
  previousCompletions: number,
  newHighestGrade: boolean,
  bonusXp: number
) {
  const baseXp = getRouteXpValue(grade);
  const isFeatureRoute = isFeaturedGrade(grade);
  let totalXp = isFeatureRoute ? 0 : baseXp;

  if (isFeatureRoute && previousCompletions > 0) {
    return { xp: 0 };
  }
  if (previousCompletions === 0) {
    totalXp += 25 + bonusXp;
  }
  if (newHighestGrade) {
    totalXp += 250;
  }
  if (previousCompletions > 0 && !isFeatureRoute) {
    const additionalXp = Math.floor(previousCompletions * (baseXp * 0.2));
    totalXp -= additionalXp;
    if (totalXp < 0) {
      totalXp = 0;
    }
  }

  return { xp: totalXp };
}

function getRouteXpValue(grade: string) {
  const boulderGrades: Record<string, number> = {
    competition: 0,
    vfeature: 0,
    vb: 10,
    v0: 20,
    v1: 21,
    v2: 26,
    v3: 35,
    v4: 44,
    v5: 64,
    v6: 88,
    v7: 110,
    v8: 155,
    v9: 175,
    v10: 210,
  };
  const ropeGrades: Record<string, number> = {
    competition: 0,
    "5.feature": 0,
    "5.b": 10,
    "5.7-": 20,
    "5.7": 20,
    "5.7+": 21,
    "5.8-": 21,
    "5.8": 26,
    "5.8+": 28,
    "5.9-": 28,
    "5.9": 31,
    "5.9+": 35,
    "5.10-": 39,
    "5.10": 42,
    "5.10+": 48,
    "5.11-": 60,
    "5.11": 73,
    "5.11+": 88,
    "5.12-": 105,
    "5.12": 123,
    "5.12+": 143,
    "5.13-": 164,
    "5.13": 187,
    "5.13+": 212,
  };

  const normalized = grade.toLowerCase();
  return normalized.startsWith("v") ? (boulderGrades[normalized] ?? 0) : (ropeGrades[normalized] ?? 0);
}

function isNewHighestGrade(user: Doc<"users">, routeType: "BOULDER" | "ROPE", nextGrade: string) {
  return routeType === "ROPE"
    ? isHigherGrade(user.highestRopeGrade ?? null, nextGrade, routeType)
    : isHigherGrade(user.highestBoulderGrade ?? null, nextGrade, routeType);
}

function isHigherGrade(currentGrade: string | null, nextGrade: string, routeType: "BOULDER" | "ROPE") {
  const ropeGrades = [
    "5.b",
    "5.7-",
    "5.7",
    "5.7+",
    "5.8-",
    "5.8",
    "5.8+",
    "5.9-",
    "5.9",
    "5.9+",
    "5.10-",
    "5.10",
    "5.10+",
    "5.11-",
    "5.11",
    "5.11+",
    "5.12-",
    "5.12",
    "5.12+",
    "5.13-",
    "5.13",
    "5.13+",
  ];
  const boulderGrades = ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

  if (!currentGrade) {
    return true;
  }

  const grades = routeType === "ROPE" ? ropeGrades : boulderGrades;
  return grades.indexOf(currentGrade.toLowerCase()) < grades.indexOf(nextGrade.toLowerCase());
}

function getHighestGrade(grades: string[], routeType: "BOULDER" | "ROPE") {
  if (grades.length === 0) {
    return null;
  }

  const ordered = routeType === "ROPE"
    ? [
        "5.b",
        "5.7-",
        "5.7",
        "5.7+",
        "5.8-",
        "5.8",
        "5.8+",
        "5.9-",
        "5.9",
        "5.9+",
        "5.10-",
        "5.10",
        "5.10+",
        "5.11-",
        "5.11",
        "5.11+",
        "5.12-",
        "5.12",
        "5.12+",
        "5.13-",
        "5.13",
        "5.13+",
      ]
    : ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

  return grades
    .slice()
    .sort((a, b) => ordered.indexOf(b.toLowerCase()) - ordered.indexOf(a.toLowerCase()))[0] ?? null;
}
