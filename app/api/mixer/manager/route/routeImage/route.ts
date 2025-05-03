import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { routeId, newImage } = await request.json();
  console.log(routeId, newImage);
  try {
    const route = await prisma.mixerRoute.update({
      where: {
        id: routeId,
    },
    data: {
      imageUrl: newImage,
    },
  });

    return NextResponse.json({ message: "Route image updated" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error updating route image" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  const { routeId } = await request.json();
  const route = await prisma.mixerRoute.update({
    where: {
      id: routeId,
    },
    data: {
      imageUrl: null,
    },
  });

  return NextResponse.json({ message: "Route image removed" }, { status: 200 });
}
