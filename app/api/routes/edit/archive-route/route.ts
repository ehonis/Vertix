import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { Route } from "@prisma/client";
import { auth } from "@/auth";
import { removeRoutesFromAllSlides } from "@/lib/tvSlideHelpers";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }
  const { routes }: { routes: Route[] } = await request.json();

  try {
    const routeIds = routes.map(route => route.id);
    
    // Remove routes from all TV slides before archiving
    await removeRoutesFromAllSlides(routeIds);
    
    await prisma.route.updateMany({
      where: { id: { in: routeIds } },
      data: { isArchive: true },
    });
    return NextResponse.json({ message: "Successfully archived routes" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to archive routes" }, { status: 500 });
  }
}
