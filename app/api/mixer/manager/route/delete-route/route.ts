import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function DELETE(request: NextRequest) {
  const { routeId } = await request.json();

  try {
    await prisma.mixerRoute.delete({
      where: {
        id: routeId,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: "Route not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Route deleted successfully",
    },
    { status: 200 }
  );
}
