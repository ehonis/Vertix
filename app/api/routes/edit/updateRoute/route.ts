import { NextResponse, NextRequest } from "next/server";
import { addRouteToFeaturedSlide, removeRouteFromAllSlides } from "@/lib/tvSlideHelpers";
import jwt from "jsonwebtoken";
import { UserRole } from "@/generated/prisma/client";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

async function getUserIdAndRole(
  request: NextRequest
): Promise<{ userId: string; role: UserRole } | null> {
  const currentUser = await getCurrentAppUser();
  if (currentUser?.id && currentUser.role) {
    return { userId: currentUser.id, role: currentUser.role as UserRole };
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const currentUser = await createConvexServerClient().query(api.users.getCurrent, {});
      const user = currentUser && currentUser._id === decoded.userId ? currentUser : null;
      if (user) return { userId: user._id, role: user.role };
    } catch {
      // invalid JWT
    }
  }
  return null;
}

export async function PATCH(request: NextRequest) {
  const authResult = await getUserIdAndRole(request);

  if (!authResult) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 403 });
  }
  if (authResult.role !== UserRole.ADMIN && authResult.role !== UserRole.ROUTE_SETTER) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }

  const { routeId, newTitle, newType, newGrade, newDate, newLocation, newX, newY } =
    await request.json();

  try {
    const convex = createConvexServerClient();
    const currentRoute = await convex.query(api.routes.getRouteByLegacyOrConvexId, { routeId });

    if (!currentRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    if (
      newTitle === undefined &&
      newType === undefined &&
      newGrade === undefined &&
      newDate === undefined &&
      newLocation === undefined &&
      newX === undefined &&
      newY === undefined
    ) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 200 });
    }

    await convex.mutation(api.routes.updateRoute, {
      routeId,
      newTitle,
      newType,
      newGrade,
      newDate: newDate ? new Date(newDate).getTime() : undefined,
      newLocation,
      newX,
      newY,
    });

    if (newGrade !== undefined) {
      const oldGrade = currentRoute.grade.toLowerCase();
      const newGradeLower = newGrade?.toLowerCase() || oldGrade;
      const wasFeatured = oldGrade === "vfeature" || oldGrade === "5.feature";
      const isNowFeatured = newGradeLower === "vfeature" || newGradeLower === "5.feature";
      if (wasFeatured && !isNowFeatured) {
        await removeRouteFromAllSlides(routeId);
      } else if (!wasFeatured && isNowFeatured) {
        await addRouteToFeaturedSlide(routeId, newGrade);
      } else if (isNowFeatured) {
        await addRouteToFeaturedSlide(routeId, newGrade);
      }
    }

    return NextResponse.json({ message: "Successfully updated route" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}
