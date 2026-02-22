import { RouteType } from "@/generated/prisma/client";
import prisma from "@/prisma";

export const BOUNTY_BASE_XP = 100;
export const BOUNTY_DAILY_INCREMENT_XP = 50;
export const BOUNTY_TARGET_PER_TYPE = 3;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type FillTypeResult = {
  routeType: RouteType;
  activeCount: number;
  targetCount: number;
  createdCount: number;
  selectedRouteIds: string[];
};

export type FillBountiesSummary = {
  createdCount: number;
  rope: FillTypeResult;
  boulder: FillTypeResult;
};

function shuffleArray<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

async function fillBountiesForType(routeType: RouteType): Promise<FillTypeResult> {
  const activeCount = await prisma.bounty.count({
    where: {
      isActive: true,
      claimedAt: null,
      route: {
        type: routeType,
      },
    },
  });

  const slotsToFill = BOUNTY_TARGET_PER_TYPE - activeCount;
  if (slotsToFill <= 0) {
    return {
      routeType,
      activeCount,
      targetCount: BOUNTY_TARGET_PER_TYPE,
      createdCount: 0,
      selectedRouteIds: [],
    };
  }

  const oneWeekAgo = new Date(Date.now() - ONE_WEEK_MS);
  const eligibleRoutes = await prisma.route.findMany({
    where: {
      isArchive: false,
      type: routeType,
      completions: {
        none: {
          completionDate: {
            gte: oneWeekAgo,
          },
        },
      },
      bounties: {
        none: {
          isActive: true,
          claimedAt: null,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const selectedRoutes = shuffleArray(eligibleRoutes).slice(0, slotsToFill);
  if (!selectedRoutes.length) {
    return {
      routeType,
      activeCount,
      targetCount: BOUNTY_TARGET_PER_TYPE,
      createdCount: 0,
      selectedRouteIds: [],
    };
  }

  const createResult = await prisma.bounty.createMany({
    data: selectedRoutes.map(route => ({
      routeId: route.id,
      baseXp: BOUNTY_BASE_XP,
      dailyIncrementXp: BOUNTY_DAILY_INCREMENT_XP,
    })),
  });

  return {
    routeType,
    activeCount,
    targetCount: BOUNTY_TARGET_PER_TYPE,
    createdCount: createResult.count,
    selectedRouteIds: selectedRoutes.map(route => route.id),
  };
}

export async function fillMissingBounties(): Promise<FillBountiesSummary> {
  const [rope, boulder] = await Promise.all([
    fillBountiesForType(RouteType.ROPE),
    fillBountiesForType(RouteType.BOULDER),
  ]);

  return {
    createdCount: rope.createdCount + boulder.createdCount,
    rope,
    boulder,
  };
}

export async function addManualBounty(routeId: string) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    select: {
      id: true,
      isArchive: true,
    },
  });

  if (!route) {
    return { created: false as const, reason: "ROUTE_NOT_FOUND" as const };
  }

  if (route.isArchive) {
    return { created: false as const, reason: "ROUTE_ARCHIVED" as const };
  }

  const existingActiveBounty = await prisma.bounty.findFirst({
    where: {
      routeId,
      isActive: true,
      claimedAt: null,
    },
    select: { id: true },
  });

  if (existingActiveBounty) {
    return { created: false as const, reason: "ALREADY_ACTIVE" as const };
  }

  const bounty = await prisma.bounty.create({
    data: {
      routeId,
      baseXp: BOUNTY_BASE_XP,
      dailyIncrementXp: BOUNTY_DAILY_INCREMENT_XP,
    },
    select: {
      id: true,
      routeId: true,
      startedAt: true,
      baseXp: true,
      dailyIncrementXp: true,
    },
  });

  return { created: true as const, bounty };
}
