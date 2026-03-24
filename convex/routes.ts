import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const routeTypeValidator = v.union(v.literal("BOULDER"), v.literal("ROPE"));

type RouteReadModel = {
  id: string;
  convexId: string;
  title: string;
  grade: string;
  color: string;
  type: "BOULDER" | "ROPE";
  setDate: number;
  isArchive: boolean;
  xp: number;
  bonusXp: number;
  x: number | null;
  y: number | null;
  order: number | null;
  location: string;
  completions: Array<{
    id: string;
    userId: string;
    routeId: string;
    flash: boolean;
    xpEarned: number;
  }>;
  attempts: Array<{ id: string; userId: string; routeId: string; attempts: number }>;
  communityGrades: Array<{ id: string; userId: string; routeId: string; grade: string }>;
  completed: boolean;
};

type WallRoutesResult = {
  hasRouteData: boolean;
  routes: RouteReadModel[];
};

export const getWallRoutes = query({
  args: { wallPart: v.string() },
  handler: async (ctx, args): Promise<WallRoutesResult | null> => {
    const wall = await ctx.db
      .query("gymWalls")
      .withIndex("by_part_key", q => q.eq("partKey", args.wallPart))
      .unique();

    if (!wall) {
      return null;
    }

    const currentUser: Doc<"users"> | null = await ctx.runQuery(api.users.getCurrent, {});
    const hasRouteData = (await ctx.db.query("routes").take(1)).length > 0;
    const routeDocs = await ctx.db
      .query("routes")
      .withIndex("by_wall", q => q.eq("gymWallId", wall._id))
      .take(100);

    const activeRoutes = routeDocs.filter(route => !route.isArchived);
    const location = wall.partKey;

    const routes = await Promise.all(
      activeRoutes.map(async route => {
        const completions = currentUser
          ? await getRouteCompletionsForUser(ctx, route._id, currentUser._id)
          : [];
        const attempts = currentUser
          ? await getRouteAttemptsForUser(ctx, route._id, currentUser._id)
          : [];
        const communityGrades = await getCommunityGrades(ctx, route._id);

        return {
          id: route.legacyPrismaId ?? route._id,
          convexId: route._id,
          title: route.title,
          grade: route.grade,
          color: route.color,
          type: route.type,
          setDate: route.setDate,
          isArchive: route.isArchived,
          xp: route.xp,
          bonusXp: route.bonusXp ?? 0,
          x: route.x ?? null,
          y: route.y ?? null,
          order: route.sortOrder ?? null,
          location,
          completions,
          attempts,
          communityGrades,
          completed: completions.length > 0,
        } satisfies RouteReadModel;
      })
    );

    return {
      hasRouteData,
      routes: routes.sort(compareRoutes),
    };
  },
});

export const getRouteByLegacyOrConvexId = query({
  args: {
    routeId: v.string(),
    viewerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args): Promise<RouteReadModel | null> => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);

    if (!route) {
      return null;
    }

    const location = await resolveLocationForRoute(ctx, route);
    const communityGrades = await getCommunityGrades(ctx, route._id);
    const completions = args.viewerUserId
      ? await getRouteCompletionsForUser(ctx, route._id, args.viewerUserId)
      : [];
    const attempts = args.viewerUserId
      ? await getRouteAttemptsForUser(ctx, route._id, args.viewerUserId)
      : [];

    return {
      id: route.legacyPrismaId ?? route._id,
      convexId: route._id,
      title: route.title,
      grade: route.grade,
      color: route.color,
      type: route.type,
      setDate: route.setDate,
      isArchive: route.isArchived,
      xp: route.xp,
      bonusXp: route.bonusXp ?? 0,
      x: route.x ?? null,
      y: route.y ?? null,
      order: route.sortOrder ?? null,
      location,
      completions,
      attempts,
      communityGrades,
      completed: completions.length > 0,
    } satisfies RouteReadModel;
  },
});

export const getProfileDashboardData = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profileUser = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .unique();

    if (!profileUser) {
      return null;
    }

    const completionRows = await ctx.db
      .query("routeCompletions")
      .withIndex("by_user", q => q.eq("userId", profileUser._id))
      .take(5000);
    const attemptRows = await ctx.db
      .query("routeAttempts")
      .withIndex("by_user", q => q.eq("userId", profileUser._id))
      .take(5000);

    const routeIds = Array.from(
      new Set([...completionRows.map(row => row.routeId), ...attemptRows.map(row => row.routeId)])
    );
    const routeMap = new Map<string, Doc<"routes">>();

    for (const routeId of routeIds) {
      const route = await ctx.db.get(routeId);
      if (route) {
        routeMap.set(routeId, route);
      }
    }

    const completions = completionRows
      .map(row => {
        const route = routeMap.get(row.routeId);
        if (!route) {
          return null;
        }

        return {
          id: row.legacyPrismaId ?? row._id,
          userId: row.userId,
          routeId: row.routeId,
          flash: row.flash,
          xpEarned: row.xpEarned,
          completionDate: row.completionDate,
          route: {
            id: route.legacyPrismaId ?? route._id,
            title: route.title,
            grade: route.grade,
            type: route.type,
            color: route.color,
          },
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.completionDate - a.completionDate);

    const attempts = attemptRows
      .map(row => {
        const route = routeMap.get(row.routeId);
        if (!route) {
          return null;
        }

        return {
          id: row.legacyPrismaId ?? row._id,
          userId: row.userId,
          routeId: row.routeId,
          attempts: row.attempts,
          attemptDate: row.attemptDate,
          route: {
            id: route.legacyPrismaId ?? route._id,
            title: route.title,
            grade: route.grade,
            type: route.type,
            color: route.color,
          },
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.attemptDate - a.attemptDate);

    return {
      user: {
        ...profileUser,
        id: profileUser._id,
      },
      completions,
      attempts,
    };
  },
});

export const getLeaderboardData = query({
  args: {},
  handler: async ctx => {
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
        private: user.private,
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
              private: user.private,
            },
            xp: row.xp,
          };
        })
      )
    )
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.xp - a.xp);

    return {
      total,
      monthly,
      currentMonth: today.toLocaleString("default", { month: "short" }),
    };
  },
});

export const getTaggedRoutes = query({
  args: {
    tags: v.array(v.string()),
    viewerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const routes = await ctx.db.query("routes").take(10000);
    const filtered = routes.filter(route => {
      if (route.isArchived) {
        return false;
      }

      return args.tags.some(tag => route.title.toLowerCase().includes(tag.toLowerCase()));
    });

    const hydrated = await Promise.all(
      filtered.map(route => buildRouteReadModel(ctx, route, args.viewerUserId ?? null))
    );

    return hydrated;
  },
});

export const searchRoutes = query({
  args: {
    text: v.string(),
    take: v.number(),
    skip: v.number(),
    viewerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim().toLowerCase();
    const routes = await ctx.db.query("routes").take(10000);
    const filtered = routes.filter(route => {
      if (!text) {
        return true;
      }

      return [route.title, route.color, route.grade].some(value =>
        value.toLowerCase().includes(text)
      );
    });
    const sorted = filtered.sort((a, b) => {
      if (a.isArchived !== b.isArchived) {
        return a.isArchived ? 1 : -1;
      }

      return compareRoutes(
        routeDocToReadModelSeed(a, a.legacyLocationKey ?? "unknown"),
        routeDocToReadModelSeed(b, b.legacyLocationKey ?? "unknown")
      );
    });
    const page = sorted.slice(args.skip, args.skip + args.take);
    const hydrated = await Promise.all(
      page.map(route => buildRouteReadModel(ctx, route, args.viewerUserId ?? null))
    );

    return {
      data: hydrated,
      totalCount: filtered.length,
      hasMore: filtered.length > args.skip + hydrated.length,
    };
  },
});

export const incrementAttempt = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.string(),
  },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const existing = await ctx.db
      .query("routeAttempts")
      .withIndex("by_user_route", q => q.eq("userId", args.userId).eq("routeId", route._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        attempts: existing.attempts + 1,
        attemptDate: Date.now(),
      });
      return { status: "updated" };
    }

    await ctx.db.insert("routeAttempts", {
      userId: args.userId,
      routeId: route._id,
      attempts: 1,
      attemptDate: Date.now(),
    });
    return { status: "created" };
  },
});

export const upsertCommunityGrade = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.string(),
    selectedGrade: v.string(),
  },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const existing = await ctx.db
      .query("communityGrades")
      .withIndex("by_user_route", q => q.eq("userId", args.userId).eq("routeId", route._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        grade: args.selectedGrade,
        updatedAt: Date.now(),
      });
      return { status: "updated" };
    }

    await ctx.db.insert("communityGrades", {
      userId: args.userId,
      routeId: route._id,
      grade: args.selectedGrade,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { status: "created" };
  },
});

export const completeRoute = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.string(),
    flash: v.boolean(),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingCompletions = await ctx.db
      .query("routeCompletions")
      .withIndex("by_user_route", q => q.eq("userId", args.userId).eq("routeId", route._id))
      .take(100);

    const newHighestGrade = isNewHighestGrade(user, route.type, route.grade);
    const xpData = calculateCompletionXp(
      route.grade,
      existingCompletions.length,
      newHighestGrade,
      route.bonusXp ?? 0
    );

    const patch: Partial<Doc<"users">> = { totalXp: user.totalXp + xpData.xp };
    if (
      route.type === "ROPE" &&
      isHigherGrade(user.highestRopeGrade ?? null, route.grade, "ROPE")
    ) {
      patch.highestRopeGrade = route.grade;
    }
    if (
      route.type === "BOULDER" &&
      isHigherGrade(user.highestBoulderGrade ?? null, route.grade, "BOULDER")
    ) {
      patch.highestBoulderGrade = route.grade;
    }
    await ctx.db.patch(user._id, patch);

    await ctx.db.insert("routeCompletions", {
      userId: args.userId,
      routeId: route._id,
      flash: args.flash,
      completionDate: args.completedAt ?? Date.now(),
      xpEarned: xpData.xp,
      gradeSnapshot: {
        highestRopeGrade: patch.highestRopeGrade ?? user.highestRopeGrade,
        highestBoulderGrade: patch.highestBoulderGrade ?? user.highestBoulderGrade,
        totalXp: user.totalXp + xpData.xp,
      },
    });

    return { xpEarned: xpData.xp };
  },
});

export const updateRouteSortOrders = mutation({
  args: {
    routes: v.array(
      v.object({
        id: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;

    for (const routeUpdate of args.routes) {
      const route = await findRouteByLegacyOrConvexId(ctx, routeUpdate.id);
      if (!route) {
        continue;
      }

      await ctx.db.patch(route._id, { sortOrder: routeUpdate.order });
      updatedCount += 1;
    }

    return { updatedCount };
  },
});

export const updateRoute = mutation({
  args: {
    routeId: v.string(),
    newTitle: v.optional(v.string()),
    newType: v.optional(routeTypeValidator),
    newGrade: v.optional(v.string()),
    newDate: v.optional(v.number()),
    newLocation: v.optional(v.string()),
    newX: v.optional(v.union(v.number(), v.null())),
    newY: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const patch: Partial<Doc<"routes">> = {};
    if (args.newTitle !== undefined) patch.title = args.newTitle;
    if (args.newType !== undefined) patch.type = args.newType;
    if (args.newGrade !== undefined) {
      patch.grade = args.newGrade;
      patch.bonusXp = isFeaturedGrade(args.newGrade) ? 200 : 0;
    }
    if (args.newDate !== undefined) patch.setDate = args.newDate;
    if (args.newLocation !== undefined) patch.legacyLocationKey = args.newLocation;
    if (args.newX !== undefined) patch.x = args.newX ?? undefined;
    if (args.newY !== undefined) patch.y = args.newY ?? undefined;

    await ctx.db.patch(route._id, patch);
    return { ok: true };
  },
});

export const createRoute = mutation({
  args: {
    title: v.string(),
    grade: v.string(),
    setDate: v.number(),
    sortOrder: v.optional(v.number()),
    wallPart: v.string(),
    type: routeTypeValidator,
    color: v.string(),
    xp: v.number(),
    createdByUserId: v.optional(v.id("users")),
    bonusXp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const wall = await ctx.db
      .query("gymWalls")
      .withIndex("by_part_key", q => q.eq("partKey", args.wallPart))
      .unique();

    if (!wall) {
      throw new Error("Wall not found");
    }

    return await ctx.db.insert("routes", {
      gymId: wall.gymId,
      gymAreaId: wall.gymAreaId,
      gymZoneId: wall.gymZoneId,
      gymWallId: wall._id,
      title: args.title,
      color: args.color,
      grade: args.grade,
      type: args.type,
      setDate: args.setDate,
      isArchived: false,
      xp: args.xp,
      bonusXp: args.bonusXp,
      sortOrder: args.sortOrder,
      createdByUserId: args.createdByUserId,
      legacyLocationKey: args.wallPart,
    });
  },
});

export const setRouteArchived = mutation({
  args: {
    routeIds: v.array(v.string()),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;
    for (const routeId of args.routeIds) {
      const route = await findRouteByLegacyOrConvexId(ctx, routeId);
      if (!route) {
        continue;
      }
      await ctx.db.patch(route._id, { isArchived: args.isArchived });
      updatedCount += 1;
    }
    return { updatedCount };
  },
});

async function getRouteCompletionsForUser(
  ctx: QueryCtx,
  routeId: Doc<"routes">["_id"],
  userId: Doc<"users">["_id"]
) {
  const rows = await ctx.db
    .query("routeCompletions")
    .withIndex("by_user_route", q => q.eq("userId", userId).eq("routeId", routeId))
    .take(20);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    flash: row.flash,
    xpEarned: row.xpEarned,
  }));
}

async function getRouteAttemptsForUser(
  ctx: QueryCtx,
  routeId: Doc<"routes">["_id"],
  userId: Doc<"users">["_id"]
) {
  const rows = await ctx.db
    .query("routeAttempts")
    .withIndex("by_user_route", q => q.eq("userId", userId).eq("routeId", routeId))
    .take(20);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    attempts: row.attempts,
  }));
}

async function getCommunityGrades(ctx: QueryCtx, routeId: Doc<"routes">["_id"]) {
  const rows = await ctx.db
    .query("communityGrades")
    .withIndex("by_route", q => q.eq("routeId", routeId))
    .take(50);

  return rows.map(row => ({
    id: row.legacyPrismaId ?? row._id,
    userId: row.userId,
    routeId: row.routeId,
    grade: row.grade,
  }));
}

function compareRoutes(a: RouteReadModel, b: RouteReadModel) {
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
}

async function findRouteByLegacyOrConvexId(ctx: QueryCtx | MutationCtx, routeId: string) {
  const byLegacy = await ctx.db
    .query("routes")
    .withIndex("by_legacy_prisma_id", q => q.eq("legacyPrismaId", routeId))
    .unique();

  if (byLegacy) {
    return byLegacy;
  }

  try {
    return await ctx.db.get(routeId as Doc<"routes">["_id"]);
  } catch {
    return null;
  }
}

async function buildRouteReadModel(
  ctx: QueryCtx,
  route: Doc<"routes">,
  viewerUserId: Doc<"users">["_id"] | null
) {
  const location = await resolveLocationForRoute(ctx, route);
  const communityGrades = await getCommunityGrades(ctx, route._id);
  const completions = viewerUserId
    ? await getRouteCompletionsForUser(ctx, route._id, viewerUserId)
    : [];
  const attempts = viewerUserId ? await getRouteAttemptsForUser(ctx, route._id, viewerUserId) : [];

  return {
    ...routeDocToReadModelSeed(route, location),
    communityGrades,
    completions,
    attempts,
    completed: completions.length > 0,
  } satisfies RouteReadModel;
}

function routeDocToReadModelSeed(route: Doc<"routes">, location: string) {
  return {
    id: route.legacyPrismaId ?? route._id,
    convexId: route._id,
    title: route.title,
    grade: route.grade,
    color: route.color,
    type: route.type,
    setDate: route.setDate,
    isArchive: route.isArchived,
    xp: route.xp,
    bonusXp: route.bonusXp ?? 0,
    x: route.x ?? null,
    y: route.y ?? null,
    order: route.sortOrder ?? null,
    location,
    communityGrades: [],
    completions: [],
    attempts: [],
    completed: false,
  };
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
  return normalized.startsWith("v")
    ? (boulderGrades[normalized] ?? 0)
    : (ropeGrades[normalized] ?? 0);
}

function isNewHighestGrade(user: Doc<"users">, routeType: "BOULDER" | "ROPE", nextGrade: string) {
  return routeType === "ROPE"
    ? isHigherGrade(user.highestRopeGrade ?? null, nextGrade, routeType)
    : isHigherGrade(user.highestBoulderGrade ?? null, nextGrade, routeType);
}

function isHigherGrade(
  currentGrade: string | null,
  nextGrade: string,
  routeType: "BOULDER" | "ROPE"
) {
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

async function resolveLocationForRoute(ctx: QueryCtx | MutationCtx, route: Doc<"routes">) {
  if (route.gymWallId) {
    const wall = await ctx.db.get(route.gymWallId);
    if (wall) {
      return wall.partKey;
    }
  }

  return route.legacyLocationKey ?? "unknown";
}
