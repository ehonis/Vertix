import { NextResponse } from "next/server";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { getRouteXp } from "@/lib/route";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { toWallPartKey } from "@/lib/wallLocations";

const ADMIN = "ADMIN";
const ROUTE_SETTER = "ROUTE_SETTER";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != ADMIN && session.user.role != ROUTE_SETTER) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { newRoute } = await req.json();

  const routeXp = getRouteXp(newRoute.grade);
  const isFeaturedGrade =
    newRoute.grade.toLowerCase() === "vfeature" ||
    newRoute.grade.toLowerCase() === "5.feature" ||
    newRoute.grade.toLowerCase() === "competition";

  if (!newRoute) {
    return NextResponse.json({ message: "No new route" }, { status: 400 });
  }

  const convex = createConvexServerClient();
  const wallPart = toWallPartKey(newRoute.location);

  if (!wallPart) {
    return NextResponse.json({ message: "Invalid route location" }, { status: 400 });
  }

  await convex.mutation(api.routes.createRoute, {
    title: newRoute.title,
    grade: newRoute.grade,
    setDate: new Date(newRoute.date).getTime(),
    sortOrder: newRoute.order ?? undefined,
    wallPart,
    type: newRoute.type,
    color: newRoute.color,
    xp: routeXp,
    createdByUserId: session.user.id as any,
    bonusXp: isFeaturedGrade ? 200 : 0,
  });

  // Add to featured route slide if it's a featured grade route
  if (isFeaturedGrade) {
    // TV stays Prisma-backed for now, so featured-slide wiring remains deferred for Convex-created routes.
  }

  return NextResponse.json({ message: "Route added successfully" });
}
