import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { RouteWithExtraData } from "@/app/api/routes/get-wall-routes-non-archive/route";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const routeId = searchParams.get("routeId");
    const userId = searchParams.get("userId");

    if (!routeId) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
    }

    let route: RouteWithExtraData | null = null;

    if (userId) {
      // If user is signed in, include completions filtered by user
      const fetchedRoute = (await prisma.route.findUnique({
        where: {
          id: routeId,
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
      })) as RouteWithExtraData | null;

      route = fetchedRoute;
    } else {
      // If user is not signed in, fetch route without completion filtering
      const fetchedRoute = await prisma.route.findUnique({
        where: {
          id: routeId,
        },
        include: {
          tags: true,
          communityGrades: true,
        },
      });

      if (fetchedRoute) {
        route = {
          ...fetchedRoute,
          completions: [],
          attempts: [],
        } as RouteWithExtraData;
      }
    }

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json({ data: route });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        message: "error finding route",
      },
      { status: 500 }
    );
  }
}
