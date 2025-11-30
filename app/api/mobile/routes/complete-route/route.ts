import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { RouteType, User } from "@prisma/client";
import {
  findIfBoulderGradeIsHigher,
  findIfRopeGradeIsHigher,
  calculateCompletionXpForRoute,
} from "@/lib/route";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret) as { userId: string };
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { routeId, flash, date } = await req.json();
    const userId = decoded.userId;

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

    // Check if this is a new highest grade
    const isNewHighestRope =
      route.type === RouteType.ROPE && findIfRopeGradeIsHigher(user as User, route);
    const isNewHighestBoulder =
      route.type === RouteType.BOULDER && findIfBoulderGradeIsHigher(user as User, route);

    if (isNewHighestRope) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          highestRopeGrade: route.grade,
        },
      });
    }

    if (isNewHighestBoulder) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          highestBoulderGrade: route.grade,
        },
      });
    }

    // Calculate XP for this completion
    const xpData = calculateCompletionXpForRoute({
      grade: route.grade,
      previousCompletions: completionCount,
      newHighestGrade: isNewHighestRope || isNewHighestBoulder,
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
    console.error("Error completing route:", error);
    return NextResponse.json(
      { message: "error completing route in api" },
      {
        status: 500,
      }
    );
  }
}

