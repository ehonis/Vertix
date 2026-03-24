import "dotenv/config";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

type MigrationLookups = {
  users: Array<{ id: string; legacyPrismaId?: string; email: string }>;
  gymWalls: Array<{
    id: string;
    gymId: string;
    gymAreaId: string;
    gymZoneId: string;
    partKey: string;
  }>;
  routes: Array<{ id: string; legacyPrismaId?: string }>;
};

type ScriptOptions = {
  dryRun: boolean;
  batchSize: number;
};

type LegacyUserRow = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  image?: string | null;
  phoneNumber?: string | null;
  role?: "ADMIN" | "ROUTE_SETTER" | "USER";
  private?: boolean;
  isOnboarded?: boolean;
  highestRopeGrade?: string | null;
  highestBoulderGrade?: string | null;
  totalXp?: number;
  clerkId?: string | null;
};

type LegacyRouteRow = {
  id: string;
  title: string;
  setDate: string;
  color: string;
  grade: string;
  type: "BOULDER" | "ROPE";
  isArchive: boolean;
  xp: number;
  location: string;
  createdByUserID: string | null;
  order: number | null;
  bonusXp: number | null;
  x: number | null;
  y: number | null;
};

type LegacyRouteImageRow = {
  id: string;
  url: string;
  routeId: string;
  createdAt: string;
};

type LegacyRouteAttemptRow = {
  id: number;
  userId: string;
  routeId: string;
  attempts: number;
  attemptDate: string;
};

type LegacyRouteCompletionRow = {
  id: number;
  userId: string;
  routeId: string;
  flash: boolean;
  completionDate: string;
  xpEarned: number;
};

type LegacyCommunityGradeRow = {
  id: number;
  userId: string;
  routeId: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
};

type LegacyMonthlyXpRow = {
  id: number;
  userId: string;
  month: number;
  year: number;
  xp: number;
};

type PreparedImportPayload = ReturnType<typeof prepareImportPayload>;

type RouteLinkedRow = { routeLegacyPrismaId: string };

type MigrationStats = {
  source: {
    routes: number;
    routeImages: number;
    routeAttempts: number;
    routeCompletions: number;
    communityGrades: number;
    monthlyXp: number;
  };
  dropped: {
    routesFromUnresolvedWalls: number;
    routesFromUnresolvedUsers: number;
    routeAttemptsFromUnresolvedUsers: number;
    routeCompletionsFromUnresolvedUsers: number;
    communityGradesFromUnresolvedUsers: number;
    monthlyXpFromUnresolvedUsers: number;
  };
};

function parseArgs(argv: string[]): ScriptOptions {
  const options: ScriptOptions = {
    dryRun: argv.includes("--dry-run"),
    batchSize: 100,
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--batch-size") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --batch-size");
      }
      options.batchSize = Number.parseInt(value, 10);
      i += 1;
    }
  }

  if (Number.isNaN(options.batchSize) || options.batchSize <= 0) {
    throw new Error("--batch-size must be a positive number");
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const migrationSecret = process.env.ROUTE_MIGRATION_SECRET;

  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  }

  if (!migrationSecret) {
    throw new Error("ROUTE_MIGRATION_SECRET is required");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const source = await loadExportFiles();
  const lookups = await convex.query(api.routeMigrations.getMigrationLookups, {
    secret: migrationSecret,
  });

  const prepared = prepareImportPayload(source, lookups);
  logSummary(prepared);

  if (options.dryRun) {
    console.log(`- source users: ${source.users.length}`);
    console.log("Dry run complete. No Convex writes performed.");
    return;
  }

  await sendBatches(
    convex,
    api.routeMigrations.upsertUsers,
    migrationSecret,
    prepareUsers(source.users),
    options.batchSize
  );

  const lookupsAfterUsers = await convex.query(api.routeMigrations.getMigrationLookups, {
    secret: migrationSecret,
  });
  const preparedAfterUsers = prepareImportPayload(source, lookupsAfterUsers);
  logSummary(preparedAfterUsers);

  await sendBatches(
    convex,
    api.routeMigrations.upsertRoutes,
    migrationSecret,
    preparedAfterUsers.routes,
    options.batchSize
  );

  const refreshedLookups = await convex.query(api.routeMigrations.getMigrationLookups, {
    secret: migrationSecret,
  });
  const routeIdLookup = new Map(
    refreshedLookups.routes.flatMap(route =>
      route.legacyPrismaId ? [[route.legacyPrismaId, route.id]] : []
    )
  );

  const routeImages = resolveRouteIds(
    preparedAfterUsers.routeImages,
    routeIdLookup,
    preparedAfterUsers.unresolved.routes
  );
  const routeAttempts = resolveRouteIds(
    preparedAfterUsers.routeAttempts,
    routeIdLookup,
    preparedAfterUsers.unresolved.routes
  );
  const routeCompletions = resolveRouteIds(
    preparedAfterUsers.routeCompletions,
    routeIdLookup,
    preparedAfterUsers.unresolved.routes
  );
  const communityGrades = resolveRouteIds(
    preparedAfterUsers.communityGrades,
    routeIdLookup,
    preparedAfterUsers.unresolved.routes
  );

  await sendBatches(
    convex,
    api.routeMigrations.upsertRouteImages,
    migrationSecret,
    routeImages,
    options.batchSize
  );
  await sendBatches(
    convex,
    api.routeMigrations.upsertRouteAttempts,
    migrationSecret,
    routeAttempts,
    options.batchSize
  );
  await sendBatches(
    convex,
    api.routeMigrations.upsertRouteCompletions,
    migrationSecret,
    routeCompletions,
    options.batchSize
  );
  await sendBatches(
    convex,
    api.routeMigrations.upsertCommunityGrades,
    migrationSecret,
    communityGrades,
    options.batchSize
  );
  await sendBatches(
    convex,
    api.routeMigrations.upsertMonthlyXp,
    migrationSecret,
    preparedAfterUsers.monthlyXp,
    options.batchSize
  );

  console.log("Route migration complete.");
}

async function loadExportFiles() {
  return {
    users: await readJsonFile<LegacyUserRow[]>("users.json"),
    routes: await readJsonFile<LegacyRouteRow[]>("routes.json"),
    routeImages: await readJsonFile<LegacyRouteImageRow[]>("routeImages.json"),
    routeAttempts: await readJsonFile<LegacyRouteAttemptRow[]>("routeAttempts.json"),
    routeCompletions: await readJsonFile<LegacyRouteCompletionRow[]>("routeCompletions.json"),
    communityGrades: await readJsonFile<LegacyCommunityGradeRow[]>("communityGrades.json"),
    monthlyXp: await readJsonFile<LegacyMonthlyXpRow[]>("monthlyXp.json"),
  };
}

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = resolve(process.cwd(), "data/prisma-route-export", fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function prepareImportPayload(
  source: Awaited<ReturnType<typeof loadExportFiles>>,
  lookups: MigrationLookups
) {
  const userIdByLegacy = new Map(
    lookups.users.flatMap((user: MigrationLookups["users"][number]) =>
      user.legacyPrismaId ? [[user.legacyPrismaId, user.id] as const] : []
    )
  );
  const userIdByEmail = new Map(
    lookups.users.map(
      (user: MigrationLookups["users"][number]) => [normalizeEmail(user.email), user.id] as const
    )
  );
  const wallByPartKey = new Map(
    lookups.gymWalls.map(
      (wall: MigrationLookups["gymWalls"][number]) => [wall.partKey, wall] as const
    )
  );

  const stats: MigrationStats = {
    source: {
      routes: source.routes.length,
      routeImages: source.routeImages.length,
      routeAttempts: source.routeAttempts.length,
      routeCompletions: source.routeCompletions.length,
      communityGrades: source.communityGrades.length,
      monthlyXp: source.monthlyXp.length,
    },
    dropped: {
      routesFromUnresolvedWalls: 0,
      routesFromUnresolvedUsers: 0,
      routeAttemptsFromUnresolvedUsers: 0,
      routeCompletionsFromUnresolvedUsers: 0,
      communityGradesFromUnresolvedUsers: 0,
      monthlyXpFromUnresolvedUsers: 0,
    },
  };

  const unresolved = {
    users: new Set<string>(),
    walls: new Set<string>(),
    routes: new Set<string>(),
  };

  const routes = source.routes.flatMap(route => {
    const wall = wallByPartKey.get(toWallPartKey(route.location));
    if (!wall) {
      unresolved.walls.add(route.location);
      stats.dropped.routesFromUnresolvedWalls += 1;
      return [];
    }

    const createdByUserId = resolveConvexUserId(
      route.createdByUserID,
      source.users,
      userIdByLegacy,
      userIdByEmail
    );
    if (route.createdByUserID && !createdByUserId) {
      unresolved.users.add(route.createdByUserID);
      stats.dropped.routesFromUnresolvedUsers += 1;
    }

    return [
      {
        legacyPrismaId: route.id,
        gymId: wall.gymId,
        gymAreaId: wall.gymAreaId,
        gymZoneId: wall.gymZoneId,
        gymWallId: wall.id,
        title: route.title,
        color: route.color,
        grade: route.grade,
        type: route.type,
        setDate: new Date(route.setDate).getTime(),
        isArchived: route.isArchive,
        xp: route.xp,
        bonusXp: route.bonusXp ?? undefined,
        x: route.x ?? undefined,
        y: route.y ?? undefined,
        sortOrder: route.order ?? undefined,
        createdByUserId: createdByUserId ?? undefined,
        createdByLegacyUserId: createdByUserId ? undefined : (route.createdByUserID ?? undefined),
        legacyLocationKey: route.location,
      },
    ];
  });

  const routeImages = source.routeImages.map((image, index) => ({
    legacyPrismaId: image.id,
    routeLegacyPrismaId: image.routeId,
    url: image.url,
    sortOrder: index,
  }));

  const routeAttempts = source.routeAttempts.flatMap(attempt => {
    const userId = resolveConvexUserId(attempt.userId, source.users, userIdByLegacy, userIdByEmail);
    if (!userId) {
      unresolved.users.add(attempt.userId);
      stats.dropped.routeAttemptsFromUnresolvedUsers += 1;
      return [];
    }

    return [
      {
        legacyPrismaId: String(attempt.id),
        routeLegacyPrismaId: attempt.routeId,
        userId,
        attempts: attempt.attempts,
        attemptDate: new Date(attempt.attemptDate).getTime(),
      },
    ];
  });

  const routeCompletions = source.routeCompletions.flatMap(completion => {
    const userId = resolveConvexUserId(
      completion.userId,
      source.users,
      userIdByLegacy,
      userIdByEmail
    );
    if (!userId) {
      unresolved.users.add(completion.userId);
      stats.dropped.routeCompletionsFromUnresolvedUsers += 1;
      return [];
    }

    return [
      {
        legacyPrismaId: String(completion.id),
        routeLegacyPrismaId: completion.routeId,
        userId,
        flash: completion.flash,
        completionDate: new Date(completion.completionDate).getTime(),
        xpEarned: completion.xpEarned,
      },
    ];
  });

  const communityGrades = source.communityGrades.flatMap(grade => {
    const userId = resolveConvexUserId(grade.userId, source.users, userIdByLegacy, userIdByEmail);
    if (!userId) {
      unresolved.users.add(grade.userId);
      stats.dropped.communityGradesFromUnresolvedUsers += 1;
      return [];
    }

    return [
      {
        legacyPrismaId: String(grade.id),
        routeLegacyPrismaId: grade.routeId,
        userId,
        grade: grade.grade,
        createdAt: new Date(grade.createdAt).getTime(),
        updatedAt: new Date(grade.updatedAt).getTime(),
      },
    ];
  });

  const monthlyXp = source.monthlyXp.flatMap(row => {
    const userId = resolveConvexUserId(row.userId, source.users, userIdByLegacy, userIdByEmail);
    if (!userId) {
      unresolved.users.add(row.userId);
      stats.dropped.monthlyXpFromUnresolvedUsers += 1;
      return [];
    }

    return [
      {
        legacyPrismaId: String(row.id),
        userId,
        month: row.month,
        year: row.year,
        xp: row.xp,
      },
    ];
  });

  return {
    routes,
    routeImages,
    routeAttempts,
    routeCompletions,
    communityGrades,
    monthlyXp,
    unresolved,
    stats,
  };
}

function prepareUsers(users: LegacyUserRow[]) {
  return users.map(user => ({
    legacyPrismaId: user.id,
    clerkId: user.clerkId ?? undefined,
    email: user.email,
    username: user.username ?? undefined,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    role: user.role ?? "USER",
    private: user.private ?? false,
    isOnboarded: user.isOnboarded ?? false,
    highestRopeGrade: user.highestRopeGrade ?? undefined,
    highestBoulderGrade: user.highestBoulderGrade ?? undefined,
    totalXp: user.totalXp ?? 0,
  }));
}

async function sendBatches<T>(
  convex: ConvexHttpClient,
  mutationRef: any,
  secret: string,
  rows: T[],
  batchSize: number
) {
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    if (batch.length === 0) {
      continue;
    }

    const result = await convex.mutation(mutationRef, { secret, rows: batch });
    console.log(`Imported batch ${index / batchSize + 1}:`, result);
  }
}

function resolveRouteIds<T extends RouteLinkedRow>(
  rows: T[],
  routeIdLookup: Map<string, string>,
  unresolvedRoutes: Set<string>
) {
  return rows.flatMap(row => {
    const routeId = routeIdLookup.get(row.routeLegacyPrismaId);
    if (!routeId) {
      unresolvedRoutes.add(row.routeLegacyPrismaId);
      return [];
    }

    const { routeLegacyPrismaId: _routeLegacyPrismaId, ...rest } = row;
    return [{ ...rest, routeId }];
  });
}

function resolveConvexUserId(
  legacyUserId: string | null,
  sourceUsers: LegacyUserRow[],
  userIdByLegacy: Map<string, string>,
  userIdByEmail: Map<string, string>
) {
  if (!legacyUserId) {
    return null;
  }

  const direct = userIdByLegacy.get(legacyUserId);
  if (direct) {
    return direct;
  }

  const sourceUser = sourceUsers.find(user => user.id === legacyUserId);
  if (!sourceUser) {
    return null;
  }

  return userIdByEmail.get(normalizeEmail(sourceUser.email)) ?? null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toWallPartKey(location: string) {
  switch (location) {
    case "ropeSouthWest":
    case "ropeSouthEast":
      return "ropeSouth";
    case "boulderNorthCave":
    case "boulderNorthSlab":
      return "boulderNorth";
    default:
      return location;
  }
}

function logSummary(prepared: PreparedImportPayload) {
  console.log("Prepared migration payload:");
  console.log(`- source routes: ${prepared.stats.source.routes}`);
  console.log(`- source routeImages: ${prepared.stats.source.routeImages}`);
  console.log(`- source routeAttempts: ${prepared.stats.source.routeAttempts}`);
  console.log(`- source routeCompletions: ${prepared.stats.source.routeCompletions}`);
  console.log(`- source communityGrades: ${prepared.stats.source.communityGrades}`);
  console.log(`- source monthlyXp: ${prepared.stats.source.monthlyXp}`);
  console.log(`- routes: ${prepared.routes.length}`);
  console.log(`- routeImages: ${prepared.routeImages.length}`);
  console.log(`- routeAttempts: ${prepared.routeAttempts.length}`);
  console.log(`- routeCompletions: ${prepared.routeCompletions.length}`);
  console.log(`- communityGrades: ${prepared.communityGrades.length}`);
  console.log(`- monthlyXp: ${prepared.monthlyXp.length}`);
  console.log(
    `- dropped routeCompletions from unresolved users: ${prepared.stats.dropped.routeCompletionsFromUnresolvedUsers}`
  );
  console.log(
    `- dropped routeAttempts from unresolved users: ${prepared.stats.dropped.routeAttemptsFromUnresolvedUsers}`
  );
  console.log(
    `- dropped communityGrades from unresolved users: ${prepared.stats.dropped.communityGradesFromUnresolvedUsers}`
  );
  console.log(
    `- dropped monthlyXp from unresolved users: ${prepared.stats.dropped.monthlyXpFromUnresolvedUsers}`
  );
  console.log(`- unresolved users: ${prepared.unresolved.users.size}`);
  console.log(`- unresolved walls: ${prepared.unresolved.walls.size}`);
  console.log(`- unresolved routes: ${prepared.unresolved.routes.size}`);
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
