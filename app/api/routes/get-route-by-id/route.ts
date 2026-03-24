import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const routeId = searchParams.get("routeId");
    const userId = searchParams.get("userId");

    if (!routeId) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
    }

    const convex = createConvexServerClient();
    const route = await convex.query(api.routes.getRouteByLegacyOrConvexId, {
      routeId,
      viewerUserId: userId ?? undefined,
    } as any);

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
