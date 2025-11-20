import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { Route, RouteCompletion } from "@prisma/client";

type RouteWithCompletions = Route & {
  completions: RouteCompletion[];
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Access individual query parameters
    const tags = searchParams.get("tags");
    const tagsArray = tags?.split(",");
    const userId = searchParams.get("userId");

    let routesWithCompletion: RouteWithCompletions[];

    if (userId) {
      // If user is signed in, include completions filtered by user
      const routes = (await prisma.route.findMany({
        where: {
          isArchive: false,
          tags: {
            some: {
              name: { in: tagsArray },
            },
          },
        },
        include: {
          completions: {
            where: {
              userId: userId,
            },
          },
          tags: true,
        },
      })) as RouteWithCompletions[];

      routesWithCompletion = routes;
    } else {
      // If user is not signed in, fetch routes without completion filtering,
      // then add an empty completions array to match our type.
      const routes = await prisma.route.findMany({
        where: {
          isArchive: false,
          tags: {
            some: {
              name: { in: tagsArray },
            },
          },
        },
      });

      routesWithCompletion = routes.map(route => ({
        ...route,
        completions: [],
      }));
    }

    // Map to add a flag (completed: true/false)
    const routesWithCompletedFlag = routesWithCompletion.map(route => ({
      ...route,
      completed: userId ? route.completions.length > 0 : false,
    }));

    return NextResponse.json({ data: routesWithCompletedFlag });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error finding route",
    });
  }
}
