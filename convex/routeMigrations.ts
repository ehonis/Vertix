import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const routeTypeValidator = v.union(v.literal("BOULDER"), v.literal("ROPE"));

const userRoleValidator = v.union(v.literal("ADMIN"), v.literal("ROUTE_SETTER"), v.literal("USER"));

const userRowValidator = v.object({
  legacyPrismaId: v.string(),
  clerkId: v.optional(v.string()),
  email: v.string(),
  username: v.optional(v.string()),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  role: userRoleValidator,
  private: v.boolean(),
  isOnboarded: v.boolean(),
  highestRopeGrade: v.optional(v.string()),
  highestBoulderGrade: v.optional(v.string()),
  totalXp: v.number(),
});

const routeRowValidator = v.object({
  legacyPrismaId: v.string(),
  gymId: v.id("gyms"),
  gymAreaId: v.id("gymAreas"),
  gymZoneId: v.id("gymZones"),
  gymWallId: v.optional(v.id("gymWalls")),
  title: v.string(),
  color: v.string(),
  grade: v.string(),
  type: routeTypeValidator,
  setDate: v.number(),
  isArchived: v.boolean(),
  xp: v.number(),
  bonusXp: v.optional(v.number()),
  x: v.optional(v.number()),
  y: v.optional(v.number()),
  sortOrder: v.optional(v.number()),
  createdByUserId: v.optional(v.id("users")),
  createdByLegacyUserId: v.optional(v.string()),
  legacyLocationKey: v.optional(v.string()),
});

const routeImageRowValidator = v.object({
  legacyPrismaId: v.string(),
  routeId: v.id("routes"),
  url: v.string(),
  sortOrder: v.optional(v.number()),
});

const routeAttemptRowValidator = v.object({
  legacyPrismaId: v.string(),
  routeId: v.id("routes"),
  userId: v.id("users"),
  attempts: v.number(),
  attemptDate: v.number(),
});

const routeCompletionRowValidator = v.object({
  legacyPrismaId: v.string(),
  routeId: v.id("routes"),
  userId: v.id("users"),
  flash: v.boolean(),
  completionDate: v.number(),
  xpEarned: v.number(),
});

const communityGradeRowValidator = v.object({
  legacyPrismaId: v.string(),
  routeId: v.id("routes"),
  userId: v.id("users"),
  grade: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const monthlyXpRowValidator = v.object({
  legacyPrismaId: v.string(),
  userId: v.id("users"),
  month: v.number(),
  year: v.number(),
  xp: v.number(),
});

type LookupResult = {
  users: Array<{ id: Id<"users">; legacyPrismaId?: string; email: string }>;
  gymWalls: Array<{
    id: Id<"gymWalls">;
    gymId: Id<"gyms">;
    gymAreaId: Id<"gymAreas">;
    gymZoneId: Id<"gymZones">;
    partKey: string;
  }>;
  routes: Array<{ id: Id<"routes">; legacyPrismaId?: string }>;
};

export const getMigrationLookups = query({
  args: { secret: v.string() },
  handler: async (_ctx, args): Promise<LookupResult> => {
    assertSecret(args.secret);

    const users = await _ctx.db.query("users").take(10000);
    const gymWalls = await _ctx.db.query("gymWalls").take(1000);
    const routes = await _ctx.db.query("routes").take(20000);

    return {
      users: users.map(user => ({
        id: user._id,
        legacyPrismaId: user.legacyPrismaId,
        email: user.email,
      })),
      gymWalls: gymWalls.map(wall => ({
        id: wall._id,
        gymId: wall.gymId,
        gymAreaId: wall.gymAreaId,
        gymZoneId: wall.gymZoneId,
        partKey: wall.partKey,
      })),
      routes: routes.map(route => ({ id: route._id, legacyPrismaId: route.legacyPrismaId })),
    };
  },
});

export const upsertRoutes = mutation({
  args: { secret: v.string(), rows: v.array(routeRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "routes", args.rows);
  },
});

export const upsertUsers = mutation({
  args: { secret: v.string(), rows: v.array(userRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);

    let inserted = 0;
    let updated = 0;

    for (const row of args.rows) {
      const byLegacy = await ctx.db
        .query("users")
        .withIndex("by_email", q => q.eq("email", row.email))
        .unique();

      const existing =
        (row.legacyPrismaId ? await findUserByLegacyPrismaId(ctx, row.legacyPrismaId) : null) ??
        byLegacy;

      const nextValues = {
        clerkId: row.clerkId ?? `legacy:${row.legacyPrismaId}`,
        email: row.email,
        username: row.username,
        name: row.name,
        image: row.image,
        phoneNumber: row.phoneNumber,
        role: row.role,
        private: row.private,
        isOnboarded: row.isOnboarded,
        highestRopeGrade: row.highestRopeGrade,
        highestBoulderGrade: row.highestBoulderGrade,
        totalXp: row.totalXp,
        legacyPrismaId: row.legacyPrismaId,
      };

      if (existing) {
        await ctx.db.patch(existing._id, nextValues);
        updated += 1;
      } else {
        await ctx.db.insert("users", nextValues);
        inserted += 1;
      }
    }

    return { inserted, updated };
  },
});

export const upsertRouteImages = mutation({
  args: { secret: v.string(), rows: v.array(routeImageRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "routeImages", args.rows);
  },
});

export const upsertRouteAttempts = mutation({
  args: { secret: v.string(), rows: v.array(routeAttemptRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "routeAttempts", args.rows);
  },
});

export const upsertRouteCompletions = mutation({
  args: { secret: v.string(), rows: v.array(routeCompletionRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "routeCompletions", args.rows);
  },
});

export const upsertCommunityGrades = mutation({
  args: { secret: v.string(), rows: v.array(communityGradeRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "communityGrades", args.rows);
  },
});

export const upsertMonthlyXp = mutation({
  args: { secret: v.string(), rows: v.array(monthlyXpRowValidator) },
  handler: async (ctx, args) => {
    assertSecret(args.secret);
    return await upsertByLegacyId(ctx, "monthlyXp", args.rows);
  },
});

function assertSecret(secret: string) {
  if (!process.env.ROUTE_MIGRATION_SECRET) {
    throw new Error("Missing ROUTE_MIGRATION_SECRET in Convex env");
  }

  if (secret !== process.env.ROUTE_MIGRATION_SECRET) {
    throw new Error("Unauthorized");
  }
}

async function upsertByLegacyId<
  T extends
    | "routes"
    | "routeImages"
    | "routeAttempts"
    | "routeCompletions"
    | "communityGrades"
    | "monthlyXp",
>(ctx: MutationCtx, table: T, rows: Array<Omit<Doc<T>, "_id" | "_creationTime">>) {
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = await ctx.db
      .query(table)
      .withIndex("by_legacy_prisma_id", (q: any) => q.eq("legacyPrismaId", row.legacyPrismaId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, row as Partial<Doc<T>>);
      updated += 1;
    } else {
      await ctx.db.insert(table, row as any);
      inserted += 1;
    }
  }

  return { inserted, updated };
}

async function findUserByLegacyPrismaId(ctx: MutationCtx, legacyPrismaId: string) {
  const users = await ctx.db.query("users").take(10000);
  return users.find(user => user.legacyPrismaId === legacyPrismaId) ?? null;
}
