import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userRole = v.union(v.literal("ADMIN"), v.literal("ROUTE_SETTER"), v.literal("USER"));

const routeType = v.union(v.literal("BOULDER"), v.literal("ROPE"));

const tvSlideType = v.union(
  v.literal("LEADERBOARD"),
  v.literal("LOGO"),
  v.literal("IMAGE"),
  v.literal("TEXT"),
  v.literal("STATS"),
  v.literal("FEATURED_ROUTE")
);

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

const svgTransform = v.object({
  value: v.string(),
});

const svgBounds = v.object({
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number(),
});

const svgPoint = v.object({
  x: v.number(),
  y: v.number(),
});

const mapFeatureType = v.union(v.literal("non_climbing_area"), v.literal("overhang"), v.literal("mat"));

const textAnchor = v.union(v.literal("start"), v.literal("middle"), v.literal("end"));

const wallShape = v.object({
  id: v.string(),
  type: wallShapeType,
  label: v.optional(v.string()),
  fillOpacity: v.optional(v.number()),
  bounds: v.optional(svgBounds),
  transform: v.optional(svgTransform),
  className: v.optional(v.string()),
  style: v.optional(v.record(v.string(), v.string())),
  attributes: v.optional(v.record(v.string(), v.string())),
  points: v.optional(v.array(svgPoint)),
  pathData: v.optional(v.string()),
  children: v.optional(v.array(v.string())),
});

const mapLabel = v.object({
  id: v.string(),
  x: v.number(),
  y: v.number(),
  text: v.string(),
  fontSize: v.optional(v.number()),
  fill: v.optional(v.string()),
  padding: v.optional(v.number()),
  backgroundColor: v.optional(v.string()),
  backgroundOpacity: v.optional(v.number()),
  outlineColor: v.optional(v.string()),
  outlineOpacity: v.optional(v.number()),
  textAnchor: v.optional(textAnchor),
  transform: v.optional(svgTransform),
});

const mapFeature = v.object({
  id: v.string(),
  type: mapFeatureType,
  name: v.optional(v.string()),
  allowOverflow: v.optional(v.boolean()),
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
  shapes: v.array(wallShape),
});

const gradeSnapshot = v.object({
  highestRopeGrade: v.optional(v.string()),
  highestBoulderGrade: v.optional(v.string()),
  totalXp: v.optional(v.number()),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    clerkTokenIdentifier: v.optional(v.string()),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: userRole,
    private: v.boolean(),
    isOnboarded: v.boolean(),
    highestRopeGrade: v.optional(v.string()),
    highestBoulderGrade: v.optional(v.string()),
    totalXp: v.number(),
    legacyPrismaId: v.optional(v.string()),
    lastActiveGymId: v.optional(v.id("gyms")),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_clerk_token_identifier", ["clerkTokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  gyms: defineTable({
    slug: v.string(),
    name: v.string(),
    shortName: v.optional(v.string()),
    isActive: v.boolean(),
    isPublic: v.boolean(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    timezone: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    legacyKey: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  gymAreas: defineTable({
    gymId: v.id("gyms"),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    floorLabel: v.optional(v.string()),
    roomLabel: v.optional(v.string()),
    mapImageUrl: v.optional(v.string()),
    mapViewBox: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_gym", ["gymId"])
    .index("by_gym_slug", ["gymId", "slug"]),

  gymZones: defineTable({
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    routeType: v.optional(routeType),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
    legacyLocationKey: v.optional(v.string()),
  })
    .index("by_gym", ["gymId"])
    .index("by_area", ["gymAreaId"])
    .index("by_area_slug", ["gymAreaId", "slug"])
    .index("by_legacy_location_key", ["legacyLocationKey"]),

  gymWalls: defineTable({
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    gymZoneId: v.id("gymZones"),
    slug: v.string(),
    name: v.string(),
    partKey: v.string(),
    svgGroupId: v.optional(v.string()),
    svgView: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isInteractive: v.boolean(),
    isActive: v.boolean(),
    allowOverflow: v.optional(v.boolean()),
    fillColor: v.optional(v.string()),
    fillOpacity: v.optional(v.number()),
    strokeColor: v.optional(v.string()),
    strokeWidth: v.optional(v.number()),
    bounds: v.optional(svgBounds),
    shapes: v.array(wallShape),
  })
    .index("by_gym", ["gymId"])
    .index("by_area", ["gymAreaId"])
    .index("by_zone", ["gymZoneId"])
    .index("by_zone_sort", ["gymZoneId", "sortOrder"])
    .index("by_part_key", ["partKey"]),

  gymAreaMaps: defineTable({
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    key: v.string(),
    name: v.string(),
    svgView: v.string(),
    displayWidth: v.optional(v.number()),
    displayHeight: v.optional(v.number()),
    nonClimbingFeatures: v.array(mapFeature),
    overhangFeatures: v.array(mapFeature),
    matFeatures: v.optional(v.array(mapFeature)),
    labels: v.array(mapLabel),
    isActive: v.boolean(),
  })
    .index("by_gym", ["gymId"])
    .index("by_area", ["gymAreaId"])
    .index("by_area_and_key", ["gymAreaId", "key"]),

  routes: defineTable({
    gymId: v.id("gyms"),
    gymAreaId: v.id("gymAreas"),
    gymZoneId: v.id("gymZones"),
    gymWallId: v.optional(v.id("gymWalls")),
    title: v.string(),
    color: v.string(),
    grade: v.string(),
    type: routeType,
    setDate: v.number(),
    isArchived: v.boolean(),
    xp: v.number(),
    bonusXp: v.optional(v.number()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    createdByUserId: v.optional(v.id("users")),
    createdByLegacyUserId: v.optional(v.string()),
    legacyPrismaId: v.optional(v.string()),
    legacyLocationKey: v.optional(v.string()),
  })
    .index("by_gym", ["gymId"])
    .index("by_zone", ["gymZoneId"])
    .index("by_wall", ["gymWallId"])
    .index("by_zone_archived", ["gymZoneId", "isArchived"])
    .index("by_gym_archived", ["gymId", "isArchived"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  wallSortPaths: defineTable({
    gymId: v.id("gyms"),
    gymWallId: v.id("gymWalls"),
    points: v.array(svgPoint),
  })
    .index("by_wall", ["gymWallId"])
    .index("by_gym", ["gymId"]),

  routeImages: defineTable({
    routeId: v.id("routes"),
    url: v.string(),
    sortOrder: v.optional(v.number()),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_route", ["routeId"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  routeAttempts: defineTable({
    userId: v.id("users"),
    routeId: v.id("routes"),
    attempts: v.number(),
    attemptDate: v.number(),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_route", ["routeId"])
    .index("by_user_route", ["userId", "routeId"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  routeCompletions: defineTable({
    userId: v.id("users"),
    routeId: v.id("routes"),
    flash: v.boolean(),
    completionDate: v.number(),
    xpEarned: v.number(),
    gradeSnapshot: v.optional(gradeSnapshot),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_route", ["routeId"])
    .index("by_user_route", ["userId", "routeId"])
    .index("by_user_completion_date", ["userId", "completionDate"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  communityGrades: defineTable({
    userId: v.id("users"),
    routeId: v.id("routes"),
    grade: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_route", ["routeId"])
    .index("by_user_route", ["userId", "routeId"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  monthlyXp: defineTable({
    userId: v.id("users"),
    month: v.number(),
    year: v.number(),
    xp: v.number(),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_year_month", ["year", "month"])
    .index("by_user_year_month", ["userId", "year", "month"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),

  climbingSessions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("AUTO"),
      v.literal("POWER"),
      v.literal("POWER_ENDURANCE"),
      v.literal("TENSION_BOARD"),
      v.literal("COMPETITION"),
      v.literal("ENDURANCE"),
      v.literal("WORKOUT"),
      v.literal("FUN"),
      v.literal("CUSTOM")
    ),
    name: v.optional(v.string()),
    status: v.union(v.literal("ACTIVE"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    lastActivityAt: v.number(),
    sessionDate: v.optional(v.string()),
    timeSlot: v.optional(v.string()),
    isRetroactive: v.optional(v.boolean()),
    isCompetition: v.optional(v.boolean()),
    competitionType: v.optional(v.union(v.literal("ONE_DAY_COMP"), v.literal("THREE_WEEK_COMP"))),
    competitionId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  routeBounties: defineTable({
    routeId: v.id("routes"),
    createdByUserId: v.id("users"),
    isActive: v.boolean(),
    startedAt: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_route_and_active", ["routeId", "isActive"]),

  tvSlides: defineTable({
    type: tvSlideType,
    imageUrl: v.optional(v.string()),
    text: v.optional(v.string()),
    isActive: v.boolean(),
    routeIds: v.array(v.id("routes")),
    sortOrder: v.optional(v.number()),
    legacyPrismaId: v.optional(v.string()),
  })
    .index("by_active", ["isActive"])
    .index("by_type", ["type"])
    .index("by_legacy_prisma_id", ["legacyPrismaId"]),
});
