import { mutation, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

type WallShape = Doc<"gymWalls">["shapes"][number];
type MapFeature = Doc<"gymAreaMaps">["nonClimbingFeatures"][number];
type MapLabel = Doc<"gymAreaMaps">["labels"][number];

const DEFAULT_GYM = {
  slug: "on-the-rocks",
  name: "On the Rocks",
  shortName: "OTR",
  isActive: true,
  isPublic: true,
  description: "Default seeded gym for the Convex migration foundation.",
  brandColor: "#1447E6",
  sortOrder: 0,
  legacyKey: "default_vertix_gym",
} as const;

const DEFAULT_AREA = {
  slug: "main-gym",
  name: "Main Gym",
  description: "Primary gym floor and topdown map.",
  roomLabel: "Main Gym",
  mapViewBox: "0 0 275 240",
  sortOrder: 0,
  isActive: true,
} as const;

const DEFAULT_ZONES = [
  {
    slug: "auto-belay",
    name: "Auto Belay",
    routeType: "ROPE" as const,
    sortOrder: 0,
    isActive: true,
    legacyLocationKey: "ABWall",
  },
  {
    slug: "rope",
    name: "Rope",
    routeType: "ROPE" as const,
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "boulder",
    name: "Boulder",
    routeType: "BOULDER" as const,
    sortOrder: 2,
    isActive: true,
  },
];

const DEFAULT_WALLS = [
  {
    slug: "rope-south",
    name: "Rope South",
    partKey: "ropeSouth",
    zoneSlug: "rope",
    sortOrder: 0,
    fillColor: "#1447E6",
    shapes: [
      rectShape("ropeSouth-1", 175, 170, 12, 20),
      rectShape("ropeSouth-2", 159, 165, 12, 25, 305),
      rectShape("ropeSouth-3", 152, 149, 12, 18, 335),
      rectShape("ropeSouth-4", 163, 144, 12, 30, 115),
      rectShape("ropeSouth-5", 135, 131, 12, 38, 70),
      rectShape("ropeSouth-6", 111.1, 190, 12, 45, 180),
    ],
  },
  {
    slug: "ab-wall",
    name: "AB Wall",
    partKey: "ABWall",
    zoneSlug: "auto-belay",
    sortOrder: 1,
    fillColor: "#1447E6",
    shapes: [
      rectShape("abWall-1", 10, 25, 12, 130),
      rectShape("abWall-2", 10, 155, 12, 25, -45),
      rectShape("abWall-3", 24, 164, 12, 26),
    ],
  },
  {
    slug: "rope-north-west",
    name: "Rope North West",
    partKey: "ropeNorthWest",
    zoneSlug: "rope",
    sortOrder: 2,
    fillColor: "#1447E6",
    shapes: [
      rectShape("ropeNorthWest-1", -8, 12, 12, 19.5, -45),
      polygonShape("ropeNorthWest-2", pointsFromString("14,17 26,17 14,29"), 45, 14, 17),
      rectShape("ropeNorthWest-3", 10, -5, 12, 30, -45),
      rectShape("ropeNorthWest-4", 32, 16, 12, 55, -90),
      rectShape("ropeNorthWest-5", 108.75, 25.5, 12, 30, -225),
      rectShape("ropeNorthWest-6", 97, 26.2, 12, 10),
      polygonShape("ropeNorthWest-7", pointsFromString("97,36 109,36 97,48")),
    ],
  },
  {
    slug: "rope-north-east",
    name: "Rope North East",
    partKey: "ropeNorthEast",
    zoneSlug: "rope",
    sortOrder: 3,
    fillColor: "#1447E6",
    shapes: [
      polygonShape("ropeNorthEast-1", pointsFromString("109,48 96.5,48 109,35.5")),
      rectShape("ropeNorthEast-2", 109, 48, 12, 15, 270),
      rectShape("ropeNorthEast-3", 124, 48, 12, 40, 208),
      rectShape("ropeNorthEast-4", 133, 19, 12, 42, 270),
      rectShape("ropeNorthEast-5", 175, 19, 12, 23, 245),
      polygonShape(
        "ropeNorthEast-6",
        pointsFromString("187,0.6 174.5,0.6 187,13.1"),
        225,
        187,
        0.6
      ),
    ],
  },
  {
    slug: "boulder-north",
    name: "Boulder North",
    partKey: "boulderNorth",
    zoneSlug: "boulder",
    sortOrder: 4,
    fillColor: "#8200DB",
    shapes: [
      rectShape("boulderNorth-1", 195, 8, 12, 50.5, 270),
      rectShape("boulderNorth-2", 239, 6, 12, 25, 305),
      rectShape("boulderNorth-3", 258, 20, 12, 20, 270),
      rectShape("boulderNorth-4", 266, 19, 12, 44),
      rectShape("boulderNorth-5", 278, 63, 12, 56.1, 90),
      polygonShape("boulderNorth-6", pointsFromString("222,63 210,63 222,75")),
    ],
  },
  {
    slug: "boulder-middle",
    name: "Boulder Middle",
    partKey: "boulderMiddle",
    zoneSlug: "boulder",
    sortOrder: 5,
    fillColor: "#8200DB",
    shapes: [
      polygonShape("boulderMiddle-1", pointsFromString("210.3,75 222.3,75 210.3,63")),
      rectShape("boulderMiddle-2", 210.3, 75, 12, 30),
      rectShape("boulderMiddle-3", 210.3, 107, 12, 30, 280),
      rectShape("boulderMiddle-4", 240, 112, 12, 20, 220),
      rectShape("boulderMiddle-5", 244, 101, 12, 38, 270),
    ],
  },
  {
    slug: "boulder-south",
    name: "Boulder South",
    partKey: "boulderSouth",
    zoneSlug: "boulder",
    sortOrder: 6,
    fillColor: "#8200DB",
    shapes: [
      rectShape("boulderSouth-1", 242, 168, 12, 40, 270),
      rectShape("boulderSouth-2", 242, 160, 12, 45),
      rectShape("boulderSouth-3", 248, 203, 12, 20),
      rectShape("boulderSouth-4", 248, 234, 12, 35, 270),
    ],
  },
] as const;

const DEFAULT_MAP = {
  key: "topdown-main",
  name: "Main Gym Topdown",
  svgView: "0 0 275 240",
  displayWidth: 330,
  displayHeight: 290,
  isActive: true,
  nonClimbingFeatures: [
    feature("outsideGymRope", "non_climbing_area", "Outside Gym Rope", "#1447E6", 0.25, [
      rectShape("outsideGymRope-1", 10, 240, 12, 225, 180),
      rectShape("outsideGymRope-2", 25, 240, 15, 85, 180),
      rectShape("outsideGymRope-3", 45, 240, 25, 50, 180),
      rectShape("outsideGymRope-4", 111, 144, 50, 21),
      rectShape("outsideGymRope-5", 111, 165, 68, 27),
      rectShape("outsideGymRope-6", 25, -5, 165, 12),
      rectShape("outsideGymRope-7", 92, -5, 45, 30),
      rectShape("outsideGymRope-8", 97, 25, 25, 15),
    ]),
    feature("outsideGymBoulder", "non_climbing_area", "Outside Gym Boulder", "#8200DB", 0.25, [
      rectShape("outsideGymBoulder-1", 250, -1, 25, 15),
      rectShape("outsideGymBoulder-2", 220, 74, 55, 26),
      rectShape("outsideGymBoulder-3", 247, 165, 50, 67),
    ]),
    feature("graffitiWall", "non_climbing_area", "Lobby", "#6B7280", 1, [
      rectShape("graffitiWall-1", 187, 190, 6, 88, 90),
      rectShape("graffitiWall-2", 186.8, 225, 30, 86.7, 90),
    ]),
    feature("hallway", "non_climbing_area", "Hallway", "#6B7280", 1, [
      rectShape("hallway-1", 24, 196, 6, 25, 270),
      rectShape("hallway-2", 49, 251, 6, 55, 180),
      rectShape("hallway-3", 48, 221, 6, 5, 270),
      rectShape("hallway-4", 67, 221, 6, 10, 270),
      rectShape("hallway-5", 71, 220, 6, 25),
    ]),
  ],
  overhangFeatures: [
    feature(
      "overhang-1",
      "overhang",
      "Boulder North Overhang",
      undefined,
      0.8,
      [rectShape("overhangRect-1", 258.8, 20, 12, 45)],
      { patternKey: "diagonal-lines", patternColor: "#4B5563", patternOpacity: 0.6 }
    ),
    feature(
      "overhang-2",
      "overhang",
      "Boulder Middle Roof",
      undefined,
      0.8,
      [
        polygonShape(
          "overhangPolygon-1",
          pointsFromString("211,107 240,110 242,130 255,160 245,175 211,135")
        ),
      ],
      { patternKey: "diagonal-lines", patternColor: "#4B5563", patternOpacity: 0.6 }
    ),
    feature(
      "overhang-3",
      "overhang",
      "Rope Arch Roof",
      undefined,
      0.8,
      [polygonShape("overhangPolygon-2", pointsFromString("98,48 135,25 162,159 138,140 100,145"))],
      { patternKey: "diagonal-lines", patternColor: "#4B5563", patternOpacity: 0.6 }
    ),
  ],
  labels: [
    label("label-auto-belay", 35, 87, "Auto Belay Wall", {
      backgroundColor: "#1976D2",
      fontSize: 12,
      fill: "#ffffff",
      transform: rotate(90, 35, 87),
    }),
    label("label-arch", 125, 100, "The Arch", {
      backgroundColor: "#1976D2",
      fontSize: 12,
      fill: "#ffffff",
    }),
    label("label-slab", 220, 20, "Slab", {
      backgroundColor: "#8200DB",
      fontSize: 12,
      fill: "#ffffff",
    }),
    label("label-graffiti", 143, 220, "Graffiti Wall", {
      backgroundColor: "#6B7280",
      fontSize: 8,
      fill: "#ffffff",
    }),
  ],
};

export const seedDefaultGymFoundation = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    gym: Doc<"gyms">;
    area: Doc<"gymAreas">;
    zones: Doc<"gymZones">[];
    walls: Doc<"gymWalls">[];
    map: Doc<"gymAreaMaps">;
  }> => {
    const gym = await upsertGym(ctx);
    const area = await upsertArea(ctx, gym._id);
    const zoneMap = await upsertZones(ctx, gym._id, area._id);
    const walls = await upsertWalls(ctx, gym._id, area._id, zoneMap);
    const map = await upsertAreaMap(ctx, gym._id, area._id);

    return {
      gym,
      area,
      zones: Array.from(zoneMap.values()),
      walls,
      map,
    };
  },
});

export const seedDefaultGym = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"gyms">> => {
    return await upsertGym(ctx);
  },
});

export const seedDefaultAreas = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"gymAreas">> => {
    const gym = await upsertGym(ctx);
    return await upsertArea(ctx, gym._id);
  },
});

export const seedDefaultZones = mutation({
  args: {},
  handler: async (ctx): Promise<Map<string, Doc<"gymZones">>> => {
    const gym = await upsertGym(ctx);
    const area = await upsertArea(ctx, gym._id);
    return await upsertZones(ctx, gym._id, area._id);
  },
});

export const seedDefaultWalls = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"gymWalls">[]> => {
    const gym = await upsertGym(ctx);
    const area = await upsertArea(ctx, gym._id);
    const zones = await upsertZones(ctx, gym._id, area._id);
    return await upsertWalls(ctx, gym._id, area._id, zones);
  },
});

export const seedDefaultAreaMap = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"gymAreaMaps">> => {
    const gym = await upsertGym(ctx);
    const area = await upsertArea(ctx, gym._id);
    return await upsertAreaMap(ctx, gym._id, area._id);
  },
});

async function upsertGym(ctx: SeedCtx): Promise<Doc<"gyms">> {
  const existing = await ctx.db
    .query("gyms")
    .withIndex("by_slug", (q: any) => q.eq("slug", DEFAULT_GYM.slug))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, DEFAULT_GYM);
    return (await ctx.db.get(existing._id))!;
  }

  const gymId = await ctx.db.insert("gyms", DEFAULT_GYM);
  return (await ctx.db.get(gymId))!;
}

async function upsertArea(ctx: SeedCtx, gymId: Id<"gyms">): Promise<Doc<"gymAreas">> {
  const existing = await ctx.db
    .query("gymAreas")
    .withIndex("by_gym_slug", (q: any) => q.eq("gymId", gymId).eq("slug", DEFAULT_AREA.slug))
    .unique();

  const areaValues = {
    ...DEFAULT_AREA,
    gymId,
  };

  if (existing) {
    await ctx.db.patch(existing._id, areaValues);
    return (await ctx.db.get(existing._id))!;
  }

  const areaId = await ctx.db.insert("gymAreas", areaValues);
  return (await ctx.db.get(areaId))!;
}

async function upsertZones(
  ctx: SeedCtx,
  gymId: Id<"gyms">,
  areaId: Id<"gymAreas">
): Promise<Map<string, Doc<"gymZones">>> {
  const zoneMap = new Map<string, Doc<"gymZones">>();

  for (const zone of DEFAULT_ZONES) {
    const existing = await ctx.db
      .query("gymZones")
      .withIndex("by_area_slug", (q: any) => q.eq("gymAreaId", areaId).eq("slug", zone.slug))
      .unique();

    const values = {
      ...zone,
      gymId,
      gymAreaId: areaId,
    };

    if (existing) {
      await ctx.db.patch(existing._id, values);
      zoneMap.set(zone.slug, (await ctx.db.get(existing._id))!);
      continue;
    }

    const zoneId = await ctx.db.insert("gymZones", values);
    zoneMap.set(zone.slug, (await ctx.db.get(zoneId))!);
  }

  return zoneMap;
}

async function upsertWalls(
  ctx: SeedCtx,
  gymId: Id<"gyms">,
  areaId: Id<"gymAreas">,
  zones: Map<string, Doc<"gymZones">>
): Promise<Doc<"gymWalls">[]> {
  const results: Doc<"gymWalls">[] = [];

  for (const wall of DEFAULT_WALLS) {
    const zone = zones.get(wall.zoneSlug);

    if (!zone) {
      throw new Error(`Missing zone for wall ${wall.partKey}`);
    }

    const existing = await ctx.db
      .query("gymWalls")
      .withIndex("by_part_key", (q: any) => q.eq("partKey", wall.partKey))
      .unique();

    const values = {
      gymId,
      gymAreaId: areaId,
      gymZoneId: zone._id,
      slug: wall.slug,
      name: wall.name,
      partKey: wall.partKey,
      svgView: DEFAULT_MAP.svgView,
      sortOrder: wall.sortOrder,
      isInteractive: true,
      isActive: true,
      fillColor: wall.fillColor,
      shapes: [...wall.shapes],
      bounds: computeBounds([...wall.shapes]),
    };

    if (existing) {
      await ctx.db.patch(existing._id, values);
      results.push((await ctx.db.get(existing._id))!);
      continue;
    }

    const wallId = await ctx.db.insert("gymWalls", values);
    results.push((await ctx.db.get(wallId))!);
  }

  return results;
}

async function upsertAreaMap(
  ctx: SeedCtx,
  gymId: Id<"gyms">,
  areaId: Id<"gymAreas">
): Promise<Doc<"gymAreaMaps">> {
  const existing = await ctx.db
    .query("gymAreaMaps")
    .withIndex("by_area_and_key", (q: any) => q.eq("gymAreaId", areaId).eq("key", DEFAULT_MAP.key))
    .unique();

  const values = {
    gymId,
    gymAreaId: areaId,
    key: DEFAULT_MAP.key,
    name: DEFAULT_MAP.name,
    svgView: DEFAULT_MAP.svgView,
    displayWidth: DEFAULT_MAP.displayWidth,
    displayHeight: DEFAULT_MAP.displayHeight,
    nonClimbingFeatures: DEFAULT_MAP.nonClimbingFeatures.map(withFeatureBounds),
    overhangFeatures: DEFAULT_MAP.overhangFeatures.map(withFeatureBounds),
    labels: [...DEFAULT_MAP.labels],
    isActive: DEFAULT_MAP.isActive,
  };

  if (existing) {
    await ctx.db.patch(existing._id, values);
    return (await ctx.db.get(existing._id))!;
  }

  const mapId = await ctx.db.insert("gymAreaMaps", values);
  return (await ctx.db.get(mapId))!;
}

function rectShape(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation?: number
): WallShape {
  return {
    id,
    type: "rect",
    bounds: { x, y, width, height },
    transform: rotation === undefined ? undefined : rotate(rotation, x, y),
  };
}

function polygonShape(
  id: string,
  points: Array<{ x: number; y: number }>,
  rotation?: number,
  centerX?: number,
  centerY?: number
): WallShape {
  return {
    id,
    type: "polygon",
    points,
    bounds: computeBoundsFromPoints(points),
    transform:
      rotation === undefined || centerX === undefined || centerY === undefined
        ? undefined
        : rotate(rotation, centerX, centerY),
  };
}

function feature(
  id: string,
  type: MapFeature["type"],
  name: string,
  fillColor: string | undefined,
  fillOpacity: number | undefined,
  shapes: WallShape[],
  extras?: Partial<
    Omit<MapFeature, "id" | "type" | "name" | "fillColor" | "fillOpacity" | "shapes">
  >
): MapFeature {
  return {
    id,
    type,
    name,
    fillColor,
    fillOpacity,
    shapes,
    ...extras,
  };
}

function label(
  id: string,
  x: number,
  y: number,
  text: string,
  extras?: Partial<Omit<MapLabel, "id" | "x" | "y" | "text">>
): MapLabel {
  return {
    id,
    x,
    y,
    text,
    backgroundOpacity: 0.7,
    textAnchor: "middle",
    ...extras,
  };
}

function rotate(degrees: number, centerX: number, centerY: number) {
  return {
    value: `rotate(${degrees} ${centerX} ${centerY})`,
  };
}

function pointsFromString(points: string) {
  return points
    .trim()
    .split(/\s+/)
    .map(pair => {
      const [xString, yString] = pair.split(",");
      return {
        x: Number(xString),
        y: Number(yString),
      };
    })
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function withFeatureBounds(item: MapFeature): MapFeature {
  return {
    ...item,
    bounds: computeBounds(item.shapes),
  };
}

function computeBounds(shapes: WallShape[]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const shape of shapes) {
    if (shape.bounds) {
      minX = Math.min(minX, shape.bounds.x);
      minY = Math.min(minY, shape.bounds.y);
      maxX = Math.max(maxX, shape.bounds.x + shape.bounds.width);
      maxY = Math.max(maxY, shape.bounds.y + shape.bounds.height);
      continue;
    }

    if (shape.points && shape.points.length > 0) {
      for (const point of shape.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return undefined;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function computeBoundsFromPoints(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return undefined;
  }

  let minX = points[0]!.x;
  let minY = points[0]!.y;
  let maxX = points[0]!.x;
  let maxY = points[0]!.y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

type SeedCtx = MutationCtx;
