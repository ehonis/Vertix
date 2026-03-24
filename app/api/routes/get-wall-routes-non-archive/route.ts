import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import type { AppRouteDetail } from "@/lib/appTypes";
import { toWallPartKey } from "@/lib/wallLocations";

export type RouteWithExtraData = AppRouteDetail;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const wall = searchParams.get("wall");
    const userId = searchParams.get("userId");
    const partKey = toWallPartKey(wall);

    if (!partKey) {
      return NextResponse.json({ data: [] });
    }

    const convex = createConvexServerClient();
    const result = await convex.query(api.routes.getWallRoutes, { wallPart: partKey });

    if (!result) {
      return NextResponse.json({ data: [] });
    }

    let routes = result.routes;

    if (!userId) {
      routes = routes.map(route => ({
        ...route,
        completions: [],
        attempts: [],
        completed: false,
      }));
    }

    return NextResponse.json({ data: routes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, message: "error finding route" }, { status: 500 });
  }
}
