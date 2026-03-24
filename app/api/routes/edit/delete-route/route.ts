import { NextResponse, NextRequest } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { removeRoutesFromAllSlides } from "@/lib/tvSlideHelpers";
import jwt from "jsonwebtoken";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

async function getUserIdAndRole(
  request: NextRequest
): Promise<{ userId: string; role: UserRole } | null> {
  const session = await auth();
  if (session?.user?.id && session.user.role) {
    return { userId: session.user.id, role: session.user.role as UserRole };
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const currentUser = await createConvexServerClient().query(api.users.getCurrent, {});
      const user = currentUser && currentUser._id === decoded.userId ? currentUser : null;
      if (user) return { userId: user._id, role: user.role };
    } catch {
      // invalid JWT
    }
  }
  return null;
}

export async function DELETE(request: NextRequest) {
  const authResult = await getUserIdAndRole(request);

  if (!authResult) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (authResult.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }
  const { routes }: { routes: Array<{ id: string }> } = await request.json();

  try {
    const routeIds = routes.map(route => route.id);

    // Remove routes from all TV slides before deleting
    await removeRoutesFromAllSlides(routeIds);

    await createConvexServerClient().mutation(api.routes.setRouteArchived, {
      routeIds,
      isArchived: true,
    });
    return NextResponse.json({ message: "Successfully archived routes" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to archive routes" }, { status: 500 });
  }
}
