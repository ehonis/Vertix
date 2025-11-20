import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { removeRouteFromAllSlides } from "@/lib/tvSlideHelpers";

export async function PATCH(request: NextRequest) {
  const { routeId, isArchive } = await request.json();

  try {
    // If archiving, remove from all TV slides
    if (isArchive) {
      await removeRouteFromAllSlides(routeId);
    }
    
    await prisma.route.update({
      where: { id: routeId },
      data: {
        isArchive: isArchive,
      },
    });
    return NextResponse.json({ message: "Successfully updated route" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}
