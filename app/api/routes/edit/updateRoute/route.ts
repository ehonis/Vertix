import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { addRouteToFeaturedSlide, removeRouteFromAllSlides } from "@/lib/tvSlideHelpers";

export async function PATCH(request: NextRequest) {
  const { routeId, newTitle, newType, newGrade, newDate, newLocation } = await request.json();

  console.log(routeId, newTitle, newType, newGrade, newDate, newLocation);

  try {
    // Get current route to check if grade changed
    const currentRoute = await prisma.route.findUnique({
      where: { id: routeId },
      select: { grade: true },
    });

    if (!currentRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const oldGrade = currentRoute.grade.toLowerCase();
    const newGradeLower = newGrade?.toLowerCase() || oldGrade;
    const wasFeatured = oldGrade === "vfeature" || oldGrade === "5.feature";
    const isNowFeatured = newGradeLower === "vfeature" || newGradeLower === "5.feature";

    // Determine bonus XP based on new grade
    const bonusXp = isNowFeatured ? 200 : 0;

    // Update the route
    await prisma.route.update({
      where: { id: routeId },
      data: {
        title: newTitle,
        type: newType,
        grade: newGrade,
        setDate: newDate,
        location: newLocation,
        bonusXp: bonusXp, // Update bonus XP based on grade
      },
    });

    // Handle TV slide membership based on grade change
    if (wasFeatured && !isNowFeatured) {
      // Removed from featured grade - remove from slide
      await removeRouteFromAllSlides(routeId);
    } else if (!wasFeatured && isNowFeatured) {
      // Changed to featured grade - add to slide
      await addRouteToFeaturedSlide(routeId, newGrade);
    } else if (isNowFeatured) {
      // Still featured - ensure it's in the slide
      await addRouteToFeaturedSlide(routeId, newGrade);
    }

    return NextResponse.json({ message: "Successfully updated route" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}
