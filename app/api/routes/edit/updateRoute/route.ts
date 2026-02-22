import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { Prisma } from "@/generated/prisma/client";
import { addRouteToFeaturedSlide, removeRouteFromAllSlides } from "@/lib/tvSlideHelpers";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";
import { UserRole } from "@/generated/prisma/client";

async function getUserIdAndRole(request: NextRequest): Promise<{ userId: string; role: UserRole } | null> {
  const session = await auth();
  if (session?.user?.id && session.user.role) {
    return { userId: session.user.id, role: session.user.role as UserRole };
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      "your-secret-key-change-in-production";
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });
      if (user) return { userId: user.id, role: user.role };
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

  const { routeId, newTitle, newType, newGrade, newDate, newLocation, newX, newY } = await request.json();

  try {
    const currentRoute = await prisma.route.findUnique({
      where: { id: routeId },
      select: { grade: true },
    });

    if (!currentRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const updateData: Prisma.RouteUpdateInput = {};
    if (newTitle !== undefined) updateData.title = newTitle;
    if (newType !== undefined) updateData.type = newType;
    if (newGrade !== undefined) updateData.grade = newGrade;
    if (newDate !== undefined && newDate != null) updateData.setDate = new Date(newDate);
    if (newLocation !== undefined) updateData.location = newLocation;
    if (typeof newX === "number") updateData.x = newX;
    if (typeof newY === "number") updateData.y = newY;

    if (newGrade !== undefined) {
      const oldGrade = currentRoute.grade.toLowerCase();
      const newGradeLower = newGrade?.toLowerCase() || oldGrade;
      const wasFeatured = oldGrade === "vfeature" || oldGrade === "5.feature";
      const isNowFeatured = newGradeLower === "vfeature" || newGradeLower === "5.feature";
      updateData.bonusXp = isNowFeatured ? 200 : 0;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 200 });
    }

    await prisma.route.update({
      where: { id: routeId },
      data: updateData,
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
