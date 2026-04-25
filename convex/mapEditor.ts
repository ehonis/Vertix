import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ── Shared validators ──────────────────────────────────────────────

const svgBounds = v.object({
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number(),
});

const svgPoint = v.object({ x: v.number(), y: v.number() });

const svgTransform = v.object({ value: v.string() });

const wallShapeType = v.union(
  v.literal("rect"),
  v.literal("polygon"),
  v.literal("path"),
  v.literal("circle"),
  v.literal("ellipse"),
  v.literal("line"),
  v.literal("polyline"),
  v.literal("group")
);

const wallShapeValidator = v.object({
  id: v.string(),
  type: wallShapeType,
  label: v.optional(v.string()),
  bounds: v.optional(svgBounds),
  transform: v.optional(svgTransform),
  className: v.optional(v.string()),
  style: v.optional(v.record(v.string(), v.string())),
  attributes: v.optional(v.record(v.string(), v.string())),
  points: v.optional(v.array(svgPoint)),
  pathData: v.optional(v.string()),
  children: v.optional(v.array(v.string())),
});

const mapFeatureType = v.union(
  v.literal("non_climbing_area"),
  v.literal("overhang"),
  v.literal("mat")
);

const textAnchor = v.union(
  v.literal("start"),
  v.literal("middle"),
  v.literal("end")
);

const mapLabelValidator = v.object({
  id: v.string(),
  x: v.number(),
  y: v.number(),
  text: v.string(),
  fontSize: v.optional(v.number()),
  fill: v.optional(v.string()),
  padding: v.optional(v.number()),
  backgroundColor: v.optional(v.string()),
  backgroundOpacity: v.optional(v.number()),
  textAnchor: v.optional(textAnchor),
  transform: v.optional(svgTransform),
});

const mapFeatureValidator = v.object({
  id: v.string(),
  type: mapFeatureType,
  name: v.optional(v.string()),
  fillColor: v.optional(v.string()),
  fillOpacity: v.optional(v.number()),
  strokeColor: v.optional(v.string()),
  strokeOpacity: v.optional(v.number()),
  strokeWidth: v.optional(v.number()),
  patternKey: v.optional(v.string()),
  patternColor: v.optional(v.string()),
  patternOpacity: v.optional(v.number()),
  sortOrder: v.optional(v.number()),
  bounds: v.optional(svgBounds),
  shapes: v.array(wallShapeValidator),
});

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

export const listGyms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gyms")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(50);
  },
});

export const listAreasForGym = query({
  args: { gymId: v.id("gyms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gymAreas")
      .withIndex("by_gym", (q) => q.eq("gymId", args.gymId))
      .take(50);
  },
});

export const listZonesForArea = query({
  args: { gymAreaId: v.id("gymAreas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gymZones")
      .withIndex("by_area", (q) => q.eq("gymAreaId", args.gymAreaId))
      .take(100);
  },
});

export const getAreaMap = query({
  args: { gymAreaId: v.id("gymAreas") },
  handler: async (ctx, args) => {
    const maps = await ctx.db
      .query("gymAreaMaps")
      .withIndex("by_area", (q) => q.eq("gymAreaId", args.gymAreaId))
      .take(10);
    return maps.find((m) => m.isActive) ?? maps[0] ?? null;
  },
});

export const listWallsForArea = query({
  args: { gymAreaId: v.id("gymAreas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gymWalls")
      .withIndex("by_area", (q) => q.eq("gymAreaId", args.gymAreaId))
      .take(200);
  },
});

// ── Gym Area Map mutations ─────────────────────────────────────────

export const upsertAreaMap = mutation({
  args: {
    id: v.optional(v.id("gymAreaMaps")),
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    key: v.string(),
    name: v.string(),
    svgView: v.string(),
    displayWidth: v.optional(v.number()),
    displayHeight: v.optional(v.number()),
    nonClimbingFeatures: v.array(mapFeatureValidator),
    overhangFeatures: v.array(mapFeatureValidator),
    matFeatures: v.optional(v.array(mapFeatureValidator)),
    labels: v.array(mapLabelValidator),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }

    return await ctx.db.insert("gymAreaMaps", data);
  },
});

export const deleteAreaMap = mutation({
  args: { id: v.id("gymAreaMaps") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// ── Gym Wall mutations ─────────────────────────────────────────────

export const upsertWall = mutation({
  args: {
    id: v.optional(v.id("gymWalls")),
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    gymZoneId: v.id("gymZones"),
    slug: v.string(),
    name: v.string(),
    partKey: v.string(),
    fillColor: v.optional(v.string()),
    strokeColor: v.optional(v.string()),
    strokeWidth: v.optional(v.number()),
    bounds: v.optional(svgBounds),
    shapes: v.array(wallShapeValidator),
    isInteractive: v.boolean(),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }

    return await ctx.db.insert("gymWalls", data);
  },
});

export const deleteWall = mutation({
  args: { id: v.id("gymWalls") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// ── Gym Area CRUD ──────────────────────────────────────────────────

export const createArea = mutation({
  args: {
    gymId: v.id("gyms"),
    slug: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("gymAreas", {
      gymId: args.gymId,
      slug: args.slug,
      name: args.name,
      isActive: args.isActive,
    });
  },
});

// ── Gym Zone CRUD ──────────────────────────────────────────────────

export const createZone = mutation({
  args: {
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    slug: v.string(),
    name: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("gymZones", {
      gymId: args.gymId,
      gymAreaId: args.gymAreaId,
      slug: args.slug,
      name: args.name,
      isActive: args.isActive,
    });
  },
});
