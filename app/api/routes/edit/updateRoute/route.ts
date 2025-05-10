import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";

export async function PATCH(request: NextRequest) {
  
  const { routeId, newTitle, newType, newGrade, newDate, newLocation } = await request.json();

  console.log(routeId, newTitle, newType, newGrade, newDate, newLocation);

  try {
    await prisma.route.update({
      where: { id: routeId },
      data: {
        title: newTitle,
        type: newType,
        grade: newGrade,
        setDate: newDate,
        location: newLocation,
      },
    });
    return NextResponse.json({ message: "Successfully updated route" }, { status: 200 } );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update route"},
      { status: 500 }
    );
  }
}
