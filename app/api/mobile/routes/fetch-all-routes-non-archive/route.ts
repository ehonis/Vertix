import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { Route, RouteCompletion, RouteAttempt, CommunityGrade, Bounty } from "@prisma/client";
import { calculateDynamicBountyXp } from "@/lib/route";

export type RouteWithExtraData = Route & {
  completions: RouteCompletion[];
  attempts: RouteAttempt[];
  communityGrades: CommunityGrade[];
  bounties: Bounty[];
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    let routesWithCompletion: RouteWithExtraData[];

    if (userId) {
      // If user is signed in, include completions filtered by user
      const routes = (await prisma.route.findMany({
        where: {
          isArchive: false,
        },
        include: {
          completions: {
            where: {
              userId: userId,
            },
          },
          attempts: {
            where: {
              userId: userId,
            },
          },
          tags: true,
          communityGrades: {
            where: {
              userId: userId,
            },
          },
          bounties: {
            where: {
              isActive: true,
              claimedAt: null,
            },
            orderBy: {
              startedAt: "asc",
            },
            take: 1,
          },
        },
        orderBy: {
          setDate: "desc",
        },
      })) as RouteWithExtraData[];

      routesWithCompletion = routes;
    } else {
      // If user is not signed in, fetch routes without completion filtering
      const routes = await prisma.route.findMany({
        where: {
          isArchive: false,
        },
        include: {
          tags: true,
          bounties: {
            where: {
              isActive: true,
              claimedAt: null,
            },
            orderBy: {
              startedAt: "asc",
            },
            take: 1,
          },
        },
        orderBy: {
          setDate: "desc",
        },
      });

      routesWithCompletion = routes.map(route => ({
        ...route,
        completions: [],
        attempts: [],
        communityGrades: [],
      }));
    }

    // Map to add a flag (completed: true/false)
    const routesWithCompletedFlag = routesWithCompletion.map(route => ({
      ...route,
      completed: userId ? route.completions.length > 0 : false,
      isBounty: route.bounties.length > 0,
      bountyStartedAt: route.bounties[0]?.startedAt ?? null,
      bountyXp:
        route.bounties.length > 0
          ? calculateDynamicBountyXp({
              startedAt: route.bounties[0].startedAt,
              baseXp: route.bounties[0].baseXp,
              dailyIncrementXp: route.bounties[0].dailyIncrementXp,
            })
          : null,
    }));

    return NextResponse.json({ data: routesWithCompletedFlag });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        message: "error finding routes",
      },
      { status: 500 }
    );
  }
}

