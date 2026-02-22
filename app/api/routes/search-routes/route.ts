import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { Route, RouteCompletion, RouteAttempt, CommunityGrade } from "@/generated/prisma/client";
import { RouteWithExtraData } from "../get-wall-routes-non-archive/route";

type RouteWithCompletions = RouteWithExtraData & {
  completions: RouteCompletion[];
  attempts: RouteAttempt[];
  communityGrades: CommunityGrade[];
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Access query parameters
    const searchTerm = searchParams.get("text") || "";
    const userId = searchParams.get("userId");
    const takeStr = searchParams.get("take");
    const skipStr = searchParams.get("skip");

    const parsedTake = takeStr ? parseInt(takeStr, 10) : 10;
    const parsedSkip = skipStr ? parseInt(skipStr, 10) : 0;

    // Build the where clause for text search
    const whereClause = {
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" as const } },
        { color: { contains: searchTerm, mode: "insensitive" as const } },
        { grade: { contains: searchTerm, mode: "insensitive" as const } },
      ],
    };

    let routesWithCompletion: RouteWithCompletions[];

    if (userId) {
      // User is signed in: include completions filtered by userId
      const routes = (await prisma.route.findMany({
        where: whereClause,
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
          communityGrades: {
            where: {
              userId: userId,
            },
          },
        },
        skip: parsedSkip,
        take: parsedTake,
      })) as RouteWithCompletions[];
      routesWithCompletion = routes;
    } else {
      // User is not signed in: fetch routes without completions and then add empty completions
      const routes = await prisma.route.findMany({
        where: whereClause,
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

    // Calculate total count for pagination
    const totalCount = await prisma.route.count({
      where: whereClause,
    });
    const hasMore = totalCount > parsedSkip + routesWithCompletion.length;

    // Add a boolean flag ("completed") to each route
    const routesWithCompletedFlag = routesWithCompletion.map(route => ({
      ...route,
      completed: userId ? route.completions.length > 0 : false,
    }));

    return NextResponse.json({
      data: routesWithCompletedFlag,
      totalCount,
      hasMore,
    });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ message: "An error occurred", status: 500 }, { status: 500 });
  }
}
