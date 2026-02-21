import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { getRouteXp } from "@/lib/route";

const MAX_ACTIVE_BOUNTIES = 3;
const BOUNTY_BASE_XP = 100;
const BOUNTY_DAILY_INCREMENT_XP = 50;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type EligibleRoute = {
  id: string;
  grade: string;
  setDate: Date;
};

function sortEligibleRoutes(routes: EligibleRoute[]) {
  return [...routes].sort((a, b) => {
    const xpDelta = (getRouteXp(b.grade) ?? 0) - (getRouteXp(a.grade) ?? 0);
    if (xpDelta !== 0) return xpDelta;

    const setDateDelta = b.setDate.getTime() - a.setDate.getTime();
    if (setDateDelta !== 0) return setDateDelta;

    return a.id.localeCompare(b.id);
  });
}

function isAuthorizedCronRequest(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const activeCount = await prisma.bounty.count({
      where: {
        isActive: true,
        claimedAt: null,
      },
    });

    const slotsToFill = MAX_ACTIVE_BOUNTIES - activeCount;
    if (slotsToFill <= 0) {
      return NextResponse.json({
        message: "Active bounty cap reached",
        activeCount,
        createdCount: 0,
      });
    }

    const oneWeekAgo = new Date(Date.now() - ONE_WEEK_MS);
    const eligibleRoutes = await prisma.route.findMany({
      where: {
        isArchive: false,
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
        grade: true,
        setDate: true,
      },
    });

    const selectedRoutes = sortEligibleRoutes(eligibleRoutes).slice(0, slotsToFill);
    if (!selectedRoutes.length) {
      return NextResponse.json({
        message: "No eligible routes found",
        activeCount,
        createdCount: 0,
      });
    }

    const createResult = await prisma.bounty.createMany({
      data: selectedRoutes.map(route => ({
        routeId: route.id,
        baseXp: BOUNTY_BASE_XP,
        dailyIncrementXp: BOUNTY_DAILY_INCREMENT_XP,
      })),
    });

    return NextResponse.json({
      message: "Route bounties generated",
      activeCountBeforeRun: activeCount,
      createdCount: createResult.count,
      selectedRouteIds: selectedRoutes.map(route => route.id),
    });
  } catch (error) {
    console.error("Error creating route bounties:", error);
    return NextResponse.json({ error: "Failed to create route bounties" }, { status: 500 });
  }
}
