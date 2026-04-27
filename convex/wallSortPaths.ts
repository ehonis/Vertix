import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const svgPoint = v.object({ x: v.number(), y: v.number() });

// ── Auth helper ────────────────────────────────────────────────────

async function requireAdmin(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_token_identifier", (q) =>
      q.eq("clerkTokenIdentifier", identity.tokenIdentifier)
    )
    .take(1);

  const found = user[0] ?? null;
  if (!found || found.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return found;
}

// ── Queries ────────────────────────────────────────────────────────

export const getByWall = query({
  args: { gymWallId: v.id("gymWalls") },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("wallSortPaths")
      .withIndex("by_wall", (q) => q.eq("gymWallId", args.gymWallId))
      .take(1);
    return results[0] ?? null;
  },
});

export const listByGym = query({
  args: { gymId: v.id("gyms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallSortPaths")
      .withIndex("by_gym", (q) => q.eq("gymId", args.gymId))
      .take(200);
  },
});

export const listByArea = query({
  args: { gymAreaId: v.id("gymAreas") },
  handler: async (ctx, args) => {
    // Get all walls for this area, then fetch their sort paths
    const walls = await ctx.db
      .query("gymWalls")
      .withIndex("by_area", (q) => q.eq("gymAreaId", args.gymAreaId))
      .take(200);

    const sortPaths: Doc<"wallSortPaths">[] = [];
    for (const wall of walls) {
      const path = await ctx.db
        .query("wallSortPaths")
        .withIndex("by_wall", (q) => q.eq("gymWallId", wall._id))
        .take(1);
      if (path[0]) {
        sortPaths.push(path[0]);
      }
    }
    return sortPaths;
  },
});

export const listAllWithPartKey = query({
  args: {},
  handler: async (ctx) => {
    const allPaths = await ctx.db.query("wallSortPaths").take(200);
    const results: Array<{ partKey: string; points: Array<{ x: number; y: number }> }> = [];
    for (const sp of allPaths) {
      const wall = await ctx.db.get(sp.gymWallId);
      if (wall) {
        results.push({ partKey: wall.partKey, points: sp.points });
      }
    }
    return results;
  },
});

// ── Mutations ──────────────────────────────────────────────────────

export const upsert = mutation({
  args: {
    gymId: v.id("gyms"),
    gymWallId: v.id("gymWalls"),
    points: v.array(svgPoint),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("wallSortPaths")
      .withIndex("by_wall", (q) => q.eq("gymWallId", args.gymWallId))
      .take(1);

    if (existing[0]) {
      await ctx.db.patch(existing[0]._id, { points: args.points });
      return existing[0]._id;
    }

    return await ctx.db.insert("wallSortPaths", {
      gymId: args.gymId,
      gymWallId: args.gymWallId,
      points: args.points,
    });
  },
});

export const remove = mutation({
  args: { gymWallId: v.id("gymWalls") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("wallSortPaths")
      .withIndex("by_wall", (q) => q.eq("gymWallId", args.gymWallId))
      .take(1);

    if (existing[0]) {
      await ctx.db.delete(existing[0]._id);
    }
  },
});
