import { NextResponse, NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { removeRouteFromAllSlides } from "@/lib/tvSlideHelpers";

export async function PATCH(request: NextRequest) {
  const { routeId, isArchive } = await request.json();

  try {
    if (isArchive) {
      await removeRouteFromAllSlides(routeId);
    }

    const convex = createConvexServerClient();
    await convex.mutation(api.routes.setRouteArchived, {
      routeIds: [routeId],
      isArchived: Boolean(isArchive),
    });
    return NextResponse.json({ message: "Successfully updated route" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}
