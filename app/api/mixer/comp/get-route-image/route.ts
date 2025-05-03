import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId");

  if (!routeId) {
    return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
  }

  const route = await prisma.mixerRoute.findUnique({
    where: {
      id: routeId,
    },
    select: {
      imageUrl: true,
    },
  });

  if (!route) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json({ imageUrl: route.imageUrl });
}
