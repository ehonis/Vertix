import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const routeTypeValidator = v.union(v.literal("BOULDER"), v.literal("ROPE"));
const tvSlideTypeValidator = v.union(
  v.literal("LOGO"),
  v.literal("STATS"),
  v.literal("LEADERBOARD"),
  v.literal("FEATURED_ROUTE"),
  v.literal("IMAGE"),
  v.literal("TEXT")
);

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
    const routeDocsByWall = await ctx.db
      .query("routes")
      .withIndex("by_wall", q => q.eq("gymWallId", wall._id))
      .take(100);
    const fallbackRouteDocs = (await ctx.db.query("routes").take(10000)).filter(
      route => route.legacyLocationKey === args.wallPart
    );
    const routeDocs = Array.from(
      new Map(
        [...routeDocsByWall, ...fallbackRouteDocs].map(route => [route._id, route] as const)
      ).values()
    );

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

export const getRouteManagerRoutes = query({
  args: {},
  handler: async ctx => {
    const routes = await ctx.db.query("routes").take(10000);
    return routes
      .filter(route => !route.isArchived)
      .map(route => ({
        _id: route._id,
        title: route.title,
        color: route.color,
        grade: route.grade,
        type: route.type,
        x: route.x ?? null,
        y: route.y ?? null,
        wallPart: route.legacyLocationKey ?? null,
      }));
  },
});

/**
 * Lightweight query for the public /routes page dot-map view.
 * Returns every placed, non-archived route with just enough data
 * to render colored dots + grade text, plus the viewer's completion count.
 */
export const getRoutesPageDots = query({
  args: {},
  handler: async (ctx) => {
    const currentUser: Doc<"users"> | null = await ctx.runQuery(api.users.getCurrent, {});
    const routes = await ctx.db.query("routes").take(10000);
    const placed = routes.filter(
      (r) => !r.isArchived && r.x != null && r.y != null,
    );

    const dots = await Promise.all(
      placed.map(async (route) => {
        let completionCount = 0;
        let attemptCount = 0;
        if (currentUser) {
          const completions = await getRouteCompletionsForUser(
            ctx,
            route._id,
            currentUser._id,
          );
          completionCount = completions.length;
          const attempts = await getRouteAttemptsForUser(
            ctx,
            route._id,
            currentUser._id,
          );
          attemptCount = attempts[0]?.attempts ?? 0;
        }
        return {
          id: route.legacyPrismaId ?? route._id,
          convexId: route._id,
          title: route.title,
          grade: route.grade,
          color: route.color,
          type: route.type,
          xp: route.xp,
          bonusXp: route.bonusXp ?? 0,
          x: route.x!,
          y: route.y!,
          wallPart: route.legacyLocationKey ?? null,
          completionCount,
          attemptCount,
          isArchived: route.isArchived,
        };
      }),
    );

    return dots;
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
    const profileUsers = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .take(1);
    const profileUser = profileUsers[0] ?? null;

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

    const completionDate = args.completedAt ?? Date.now();
    const completionMonthDate = new Date(completionDate);
    const completionMonth = completionMonthDate.getMonth() + 1;
    const completionYear = completionMonthDate.getFullYear();

    const existingMonthlyXp = await ctx.db
      .query("monthlyXp")
      .withIndex("by_user_year_month", q =>
        q.eq("userId", args.userId).eq("year", completionYear).eq("month", completionMonth)
      )
      .unique();

    if (existingMonthlyXp) {
      await ctx.db.patch(existingMonthlyXp._id, {
        xp: existingMonthlyXp.xp + xpData.xp,
      });
    } else {
      await ctx.db.insert("monthlyXp", {
        userId: args.userId,
        month: completionMonth,
        year: completionYear,
        xp: xpData.xp,
      });
    }

    await ctx.db.insert("routeCompletions", {
      userId: args.userId,
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

    return { xpEarned: xpData.xp };
  },
});

export const reorderWallRoutes = mutation({
  args: {
    wallPart: v.string(),
    orderedRouteIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Resolve every id up front so we can fail fast on a bad payload.
    const routes = await Promise.all(
      args.orderedRouteIds.map(id => findRouteByLegacyOrConvexId(ctx, id))
    );

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (!route) continue;
      // Single source of truth: position in the array == sortOrder.
      await ctx.db.patch(route._id, { sortOrder: i });
    }

    return { updatedCount: routes.filter(Boolean).length };
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
    newColor: v.optional(v.string()),
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
    if (args.newLocation !== undefined) {
      patch.legacyLocationKey = args.newLocation;
      const wall = await ctx.db
        .query("gymWalls")
        .withIndex("by_part_key", q => q.eq("partKey", args.newLocation!))
        .unique();
      if (wall) patch.gymWallId = wall._id;
    }
    if (args.newColor !== undefined) patch.color = args.newColor;
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
    x: v.optional(v.number()),
    y: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const wall = await ctx.db
      .query("gymWalls")
      .withIndex("by_part_key", q => q.eq("partKey", args.wallPart))
      .unique();

    if (!wall) {
      throw new Error("Wall not found");
    }

    const existingRoutes = await ctx.db
      .query("routes")
      .withIndex("by_wall", q => q.eq("gymWallId", wall._id))
      .take(200);
    const activeRoutes = existingRoutes.filter(route => !route.isArchived);
    const maxSortOrder = Math.max(-1, ...activeRoutes.map(route => route.sortOrder ?? -1));
    const desiredSortOrder = Math.max(
      0,
      Math.min(args.sortOrder ?? maxSortOrder + 1, maxSortOrder + 1)
    );

    for (const route of activeRoutes) {
      const routeSortOrder = route.sortOrder ?? maxSortOrder + 1;
      if (routeSortOrder >= desiredSortOrder) {
        await ctx.db.patch(route._id, { sortOrder: routeSortOrder + 1 });
      }
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
      sortOrder: desiredSortOrder,
      createdByUserId: args.createdByUserId,
      legacyLocationKey: args.wallPart,
      x: args.x,
      y: args.y,
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

export const getTvData = query({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    slides: Array<{
      id: string;
      type: "LOGO" | "STATS" | "LEADERBOARD" | "FEATURED_ROUTE" | "IMAGE" | "TEXT";
      imageUrl: string | null;
      text: string | null;
      isActive: boolean;
      sortOrder: number | null;
      routes: Array<{
        id: string;
        title: string;
        grade: string;
        color: string;
        type: "BOULDER" | "ROPE";
        setDate: number;
        bonusXp: number | null;
        images: Array<{ id: string; url: string; sortOrder: number | null }>;
      }>;
    }>;
    monthlyLeaderBoardData: Array<{
      user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        totalXp: number;
        private: boolean;
      };
      xp: number;
    }>;
    boulderGradeCounts: { grade: string; count: number }[];
    ropeGradeCounts: { grade: string; count: number }[];
    ropeTotal: number;
    boulderTotal: number;
  }> => {
    const slides = await ctx.db.query("tvSlides").take(1000);
    const activeSlides = slides
      .filter(slide => slide.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const hydratedSlides = await Promise.all(
      activeSlides.map(async slide => ({
        id: slide.legacyPrismaId ?? slide._id,
        type: slide.type,
        imageUrl: slide.imageUrl ?? null,
        text: slide.text ?? null,
        isActive: slide.isActive,
        sortOrder: slide.sortOrder ?? null,
        routes: (
          await Promise.all(
            slide.routeIds.map(async routeId => {
              const route = await ctx.db.get(routeId);
              if (!route) {
                return null;
              }
              const images = await ctx.db
                .query("routeImages")
                .withIndex("by_route", q => q.eq("routeId", route._id))
                .take(20);
              return {
                id: route.legacyPrismaId ?? route._id,
                title: route.title,
                grade: route.grade,
                color: route.color,
                type: route.type,
                setDate: route.setDate,
                bonusXp: route.bonusXp ?? null,
                images: images.map(image => ({
                  id: image.legacyPrismaId ?? image._id,
                  url: image.url,
                  sortOrder: image.sortOrder ?? null,
                })),
              };
            })
          )
        ).filter((route): route is NonNullable<typeof route> => route !== null),
      }))
    );

    const leaderboardData = await ctx.runQuery(api.routes.getLeaderboardData, {});
    const allRoutes = await ctx.db.query("routes").take(10000);
    const currentRoutes = allRoutes
      .filter(route => !route.isArchived)
      .map(route => ({
        id: route.legacyPrismaId ?? route._id,
        title: route.title,
        grade: route.grade,
        type: route.type,
        color: route.color,
        setDate: route.setDate,
        isArchive: route.isArchived,
      }));
    const counts = getGradeCountsForTv(currentRoutes);

    return {
      slides: hydratedSlides,
      monthlyLeaderBoardData: leaderboardData.monthly,
      boulderGradeCounts: counts.boulderGradeCounts,
      ropeGradeCounts: counts.ropeGradeCounts,
      ropeTotal: counts.ropeTotal,
      boulderTotal: counts.boulderTotal,
    };
  },
});

export const searchTvRoutes = query({
  args: {
    text: v.string(),
    slideId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allSlides = await ctx.db.query("tvSlides").take(1000);
    const excludedRouteIds = new Set(
      allSlides
        .filter(slide => (slide.legacyPrismaId ?? slide._id) === args.slideId)
        .flatMap(slide => slide.routeIds)
    );
    const allRoutes = await ctx.db.query("routes").take(10000);
    const filtered = allRoutes.filter(route => {
      if (route.isArchived) {
        return false;
      }
      if (excludedRouteIds.has(route._id)) {
        return false;
      }
      return args.text.length > 3 && route.title.toLowerCase().includes(args.text.toLowerCase());
    });

    return filtered.slice(0, 20).map(route => ({
      id: route.legacyPrismaId ?? route._id,
      title: route.title,
      grade: route.grade,
      color: route.color,
      setDate: route.setDate,
      bonusXp: route.bonusXp ?? null,
    }));
  },
});

export const setTvSlideActive = mutation({
  args: {
    slideId: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slide = await findTvSlideByLegacyOrConvexId(ctx, args.slideId);
    if (!slide) {
      throw new Error("Slide not found");
    }
    await ctx.db.patch(slide._id, { isActive: args.isActive });
    return { ok: true };
  },
});

export const createTvSlide = mutation({
  args: {
    type: tvSlideTypeValidator,
    imageUrl: v.optional(v.string()),
    text: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slides = await ctx.db.query("tvSlides").take(1000);
    const maxSortOrder = Math.max(-1, ...slides.map(slide => slide.sortOrder ?? -1));
    return await ctx.db.insert("tvSlides", {
      type: args.type,
      imageUrl: args.imageUrl,
      text: args.text,
      isActive: args.isActive,
      routeIds: [],
      sortOrder: maxSortOrder + 1,
    });
  },
});

export const updateTvSlideRoutes = mutation({
  args: {
    functionName: v.union(
      v.literal("addRoute"),
      v.literal("removeRoute"),
      v.literal("uploadImage")
    ),
    routeId: v.string(),
    slideId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const route = await findRouteByLegacyOrConvexId(ctx, args.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    if (args.functionName === "uploadImage") {
      if (!args.imageUrl) {
        throw new Error("Image URL required");
      }
      await ctx.db.insert("routeImages", {
        routeId: route._id,
        url: args.imageUrl,
      });
      return { ok: true };
    }

    if (!args.slideId) {
      throw new Error("Slide ID required");
    }

    const slide = await findTvSlideByLegacyOrConvexId(ctx, args.slideId);
    if (!slide) {
      throw new Error("Slide not found");
    }

    if (args.functionName === "addRoute") {
      const nextRouteIds = slide.routeIds.includes(route._id)
        ? slide.routeIds
        : [...slide.routeIds, route._id];
      await ctx.db.patch(slide._id, { routeIds: nextRouteIds });
      await ctx.db.patch(route._id, { bonusXp: 50 });
      return { ok: true };
    }

    const nextRouteIds = slide.routeIds.filter((id: Doc<"routes">["_id"]) => id !== route._id);
    await ctx.db.patch(slide._id, { routeIds: nextRouteIds });
    await ctx.db.patch(route._id, { bonusXp: 0 });
    return { ok: true };
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
  const ao = a.order ?? Number.POSITIVE_INFINITY;
  const bo = b.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
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

function getGradeCountsForTv(
  routes: Array<{
    grade: string;
    type: "BOULDER" | "ROPE";
  }>
) {
  const boulderGradeCounts = [
    { grade: "vfeature", count: 0 },
    { grade: "vb", count: 0 },
    { grade: "v0", count: 0 },
    { grade: "v1", count: 0 },
    { grade: "v2", count: 0 },
    { grade: "v3", count: 0 },
    { grade: "v4", count: 0 },
    { grade: "v5", count: 0 },
    { grade: "v6", count: 0 },
    { grade: "v7", count: 0 },
    { grade: "v8", count: 0 },
    { grade: "v9", count: 0 },
    { grade: "v10", count: 0 },
    { grade: "v11", count: 0 },
    { grade: "v12", count: 0 },
    { grade: "v13", count: 0 },
    { grade: "v14", count: 0 },
    { grade: "v15", count: 0 },
  ];
  const ropeGradeCounts = [
    { grade: "5.feature", count: 0 },
    { grade: "5.B", count: 0 },
    { grade: "5.7", count: 0 },
    { grade: "5.8", count: 0 },
    { grade: "5.8+", count: 0 },
    { grade: "5.9", count: 0 },
    { grade: "5.9+", count: 0 },
    { grade: "5.10-", count: 0 },
    { grade: "5.10", count: 0 },
    { grade: "5.10+", count: 0 },
    { grade: "5.11-", count: 0 },
    { grade: "5.11", count: 0 },
    { grade: "5.11+", count: 0 },
    { grade: "5.12-", count: 0 },
    { grade: "5.12", count: 0 },
    { grade: "5.12+", count: 0 },
    { grade: "5.13-", count: 0 },
    { grade: "5.13", count: 0 },
    { grade: "5.13+", count: 0 },
    { grade: "5.14-", count: 0 },
    { grade: "5.14", count: 0 },
    { grade: "5.14+", count: 0 },
    { grade: "5.15-", count: 0 },
  ];

  for (const route of routes) {
    const counts = route.type === "BOULDER" ? boulderGradeCounts : ropeGradeCounts;
    const entry = counts.find(count => count.grade === route.grade);
    if (entry) {
      entry.count += 1;
    }
  }

  const ropeTotal = routes.filter(route => route.type === "ROPE").length;
  const boulderTotal = routes.filter(route => route.type === "BOULDER").length;

  return {
    boulderGradeCounts: boulderGradeCounts.filter(count => count.count > 0),
    ropeGradeCounts: ropeGradeCounts.filter(count => count.count > 0),
    ropeTotal,
    boulderTotal,
  };
}

async function findTvSlideByLegacyOrConvexId(ctx: QueryCtx | MutationCtx, slideId: string) {
  const byLegacy = await ctx.db
    .query("tvSlides")
    .withIndex("by_legacy_prisma_id", q => q.eq("legacyPrismaId", slideId))
    .unique();

  if (byLegacy) {
    return byLegacy;
  }

  try {
    return await ctx.db.get(slideId as Doc<"tvSlides">["_id"]);
  } catch {
    return null;
  }
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
