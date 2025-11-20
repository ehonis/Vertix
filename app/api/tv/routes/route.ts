import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { getAllGradeCounts } from "@/lib/homepage";
import { Route } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const searchTerm = searchParams.get("text") || "";
  const slideId = searchParams.get("slideId") || "";





  let routes: Route[] = [];
  if (searchTerm.length > 3) {
    routes = await prisma.route.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" as const },
        isArchive: false,
        tvSlides: {
          none: {
            id: slideId,
          },
        },
      },
    });
  }

  return NextResponse.json({
    routes,
  });
}

export async function POST(req: NextRequest) {
  const { functionName, routeId, imageUrl, slideId } = await req.json();
  if (functionName === "addRoute") {
    const route = await prisma.route.update({
      where: { id: routeId },
      data: {bonusXp: 50}
    });
   
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    await prisma.tVSlide.update({
      where: { id: slideId },
      data: { routes: { connect: { id: routeId } } },
    });
    return NextResponse.json({ message: "Route added successfully" }, { status: 200 });
  }
  if(functionName === "uploadImage") {
    const image = await prisma.routeImage.create({
      data: { url: imageUrl, routeId: routeId },
    });
    return NextResponse.json({ message: "Image uploaded successfully" }, { status: 200 });
  }
  if(functionName === "removeRoute") {
    const route = await prisma.route.update({
      where: { id: routeId },
      data: { bonusXp: 0 },
    });
    await prisma.tVSlide.update({
      where: { id: slideId },
      data: { routes: { disconnect: { id: routeId } } },
    });
    return NextResponse.json({ message: "Route removed successfully" }, { status: 200 });
  }
  return NextResponse.json({ error: "Invalid function name" }, { status: 400 });
}