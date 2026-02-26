import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { RouteType, User } from "@/generated/prisma/client";
import {
  findIfBoulderGradeIsHigher,
  findIfRopeGradeIsHigher,
  calculateCompletionXpForRoute,
  getRouteXp,
} from "@/lib/route";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }

  try {
    const { userId, routeId, flash, date } = await req.json();

    const route = await prisma.route.findUnique({
      where: {
        id: routeId,
      },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!route) {
      return NextResponse.json({ message: "Route not found" }, { status: 404 });
    }

    // Get current completion count for XP calculation
    const existingCompletions = await prisma.routeCompletion.findMany({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    const completionCount = existingCompletions.length;

    const u = user as User;
    // Update DB when: first send (no current highest) OR this route is higher than current
    const shouldUpdateRope =
      route.type === RouteType.ROPE && (!u.highestRopeGrade || findIfRopeGradeIsHigher(u, route));
    const shouldUpdateBoulder =
      route.type === RouteType.BOULDER &&
      (!u.highestBoulderGrade || findIfBoulderGradeIsHigher(u, route));

    if (shouldUpdateRope) {
      await prisma.user.update({
        where: { id: userId },
        data: { highestRopeGrade: route.grade },
      });
    }
    if (shouldUpdateBoulder) {
      await prisma.user.update({
        where: { id: userId },
        data: { highestBoulderGrade: route.grade },
      });
    }

    // XP "new highest" bonus only when they had a previous highest and beat it (not on first send)
    const newHighestGrade =
      (route.type === RouteType.ROPE && !!u.highestRopeGrade && findIfRopeGradeIsHigher(u, route)) ||
      (route.type === RouteType.BOULDER &&
        !!u.highestBoulderGrade &&
        findIfBoulderGradeIsHigher(u, route));
    const xpData = calculateCompletionXpForRoute({
      grade: route.grade,
      previousCompletions: completionCount,
      newHighestGrade,
      bonusXp: route.bonusXp || 0,
    });

    // Create new completion record
    await prisma.routeCompletion.create({
      data: {
        userId: userId,
        routeId: routeId,
        xpEarned: xpData.xp,
        completionDate: date ? new Date(date) : new Date(),
        flash: flash || false,
      },
    });

    return NextResponse.json({
      message: "Successfully Completed Route",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "error completing route in api" },
      {
        status: 500,
      }
    );
  }
}
