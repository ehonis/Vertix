import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      wallPart: string;
      orderedRouteIds: string[];
    };

    if (!body?.wallPart || !Array.isArray(body.orderedRouteIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const convex = createConvexServerClient();
    const result = await convex.mutation(api.routes.reorderWallRoutes, {
      wallPart: body.wallPart,
      orderedRouteIds: body.orderedRouteIds,
    });

    return NextResponse.json({
      message: "Order updated successfully",
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    console.error("Error updating route order:", error);
    return NextResponse.json({ error: "Failed to update route order" }, { status: 500 });
  }
}
