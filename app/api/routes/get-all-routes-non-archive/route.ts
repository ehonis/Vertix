import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { Route, RouteCompletion, RouteAttempt, CommunityGrade } from "@prisma/client";

export type RouteWithExtraData = Route & {
  completions: RouteCompletion[];
  attempts: RouteAttempt[];
  communityGrades: CommunityGrade[];
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const takeStr = searchParams.get("take");
    const skipStr = searchParams.get("skip");

    const parsedTake = takeStr ? parseInt(takeStr, 10) : 100; // Default to 100 routes
    const parsedSkip = skipStr ? parseInt(skipStr, 10) : 0;

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
          communityGrades: true,
        },
        orderBy: {
          order: "asc",
        },
        skip: parsedSkip,
        take: parsedTake,
      })) as RouteWithExtraData[];

      routesWithCompletion = routes;
    } else {
      // If user is not signed in, fetch routes without completion filtering,
      // then add an empty completions array to match our type.
      const routes = await prisma.route.findMany({
        where: {
          isArchive: false,
        },
        orderBy: {
          order: "asc",
        },
        skip: parsedSkip,
        take: parsedTake,
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
    }));

    // Calculate total count for pagination
    const totalCount = await prisma.route.count({
      where: {
        isArchive: false,
      },
    });
    const hasMore = totalCount > parsedSkip + routesWithCompletedFlag.length;

    return NextResponse.json({
      data: routesWithCompletedFlag,
      totalCount,
      hasMore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error finding routes",
    });
  }
}

