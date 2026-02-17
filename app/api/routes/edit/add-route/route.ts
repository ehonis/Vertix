import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { RouteType } from "@prisma/client";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { getRouteXp } from "@/lib/route";
import { addRouteToFeaturedSlide } from "@/lib/tvSlideHelpers";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != UserRole.ADMIN && session.user.role != UserRole.ROUTE_SETTER) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { newRoute } = await req.json();

  const routeXp = getRouteXp(newRoute.grade);
  const isFeaturedGrade = newRoute.grade.toLowerCase() === "vfeature" || newRoute.grade.toLowerCase() === "5.feature" || newRoute.grade.toLowerCase() === "competition";

  if (!newRoute) {
    return NextResponse.json({ message: "No new route" }, { status: 400 });
  }

  const createdRoute = await prisma.route.create({
    data: {
      title: newRoute.title,
      grade: newRoute.grade,
      setDate: new Date(newRoute.date),
      order: newRoute.order,
      location: newRoute.location,
      type: newRoute.type as RouteType,
      color: newRoute.color,
      xp: routeXp,
      createdByUserID: session.user.id,
      isArchive: false,
      bonusXp: isFeaturedGrade ? 200 : 0, // Set bonus XP for featured routes
    },
  });

  // Add to featured route slide if it's a featured grade route
  if (isFeaturedGrade) {
    await addRouteToFeaturedSlide(createdRoute.id, createdRoute.grade);
  }

  return NextResponse.json({ message: "Route added successfully" });
}
