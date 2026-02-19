import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { Route } from "@prisma/client";
import { auth } from "@/auth";
import { removeRoutesFromAllSlides } from "@/lib/tvSlideHelpers";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

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
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (authResult.role !== UserRole.ADMIN) {
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
