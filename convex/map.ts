import { query, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

type GymMapFoundation = {
  gym: Doc<"gyms">;
  area: Doc<"gymAreas">;
  map: Doc<"gymAreaMaps">;
  zones: Doc<"gymZones">[];
  walls: Doc<"gymWalls">[];
};

export const getGymMapByArea = query({
  args: {},
  handler: async (ctx): Promise<GymMapFoundation | null> => {
    return await getFoundation(ctx);
  },
});

export const getRoutesMapFoundation = query({
  args: {},
  handler: async (ctx): Promise<GymMapFoundation | null> => {
    return await getFoundation(ctx);
  },
});

async function getFoundation(ctx: QueryCtx): Promise<GymMapFoundation | null> {
  const gyms = await ctx.db
    .query("gyms")
    .withIndex("by_active", (q: any) => q.eq("isActive", true))
    .take(1);

  const activeGym = gyms[0] ?? null;

  if (!activeGym) {
    return null;
  }

  const areas = await ctx.db
    .query("gymAreas")
    .withIndex("by_gym", (q: any) => q.eq("gymId", activeGym._id))
    .take(20);

  const activeArea =
    areas.filter((area: Doc<"gymAreas">) => area.isActive).sort(sortByOrder<Doc<"gymAreas">>)[0] ??
    null;

  if (!activeArea) {
    return null;
  }

  const maps = await ctx.db
    .query("gymAreaMaps")
    .withIndex("by_area", (q: any) => q.eq("gymAreaId", activeArea._id))
    .take(10);

  const activeMap = maps.find((map: Doc<"gymAreaMaps">) => map.isActive) ?? maps[0] ?? null;

  if (!activeMap) {
    return null;
  }

  const zones = await ctx.db
    .query("gymZones")
    .withIndex("by_area", (q: any) => q.eq("gymAreaId", activeArea._id))
    .take(50);

  const walls = await ctx.db
    .query("gymWalls")
    .withIndex("by_area", (q: any) => q.eq("gymAreaId", activeArea._id))
    .take(100);

  return {
    gym: activeGym,
    area: activeArea,
    map: activeMap,
    zones: zones.sort(sortByOrder<Doc<"gymZones">>),
    walls: walls.sort(sortByOrder<Doc<"gymWalls">>),
  };
}

function sortByOrder<T extends { sortOrder?: number }>(a: T, b: T) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}
