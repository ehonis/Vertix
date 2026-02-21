import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { RouteType, User } from "@prisma/client";
import {
  findIfBoulderGradeIsHigher,
  findIfRopeGradeIsHigher,
  calculateCompletionXpForRoute,
  calculateDynamicBountyXp,
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
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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

    const completionDate = date ? new Date(date) : new Date();
    const completionResult = await prisma.$transaction(async tx => {
      const completion = await tx.routeCompletion.create({
        data: {
          userId: userId,
          routeId: routeId,
          xpEarned: xpData.xp,
          completionDate,
          flash: flash || false,
        },
      });

      const activeBounty = await tx.bounty.findFirst({
        where: {
          routeId,
          isActive: true,
          claimedAt: null,
        },
        orderBy: {
          startedAt: "asc",
        },
      });

      if (!activeBounty) {
        return { bountyClaimed: false, bountyXpEarned: 0, totalXpEarned: xpData.xp };
      }

      const bountyXp = calculateDynamicBountyXp({
        startedAt: activeBounty.startedAt,
        baseXp: activeBounty.baseXp,
        dailyIncrementXp: activeBounty.dailyIncrementXp,
        now: completionDate,
      });

      const claimResult = await tx.bounty.updateMany({
        where: {
          id: activeBounty.id,
          isActive: true,
          claimedAt: null,
        },
        data: {
          isActive: false,
          claimedAt: completionDate,
          claimedByUserId: userId,
          claimedOnCompletionId: completion.id,
        },
      });

      if (claimResult.count === 0) {
        return { bountyClaimed: false, bountyXpEarned: 0, totalXpEarned: xpData.xp };
      }

      const totalXpEarned = xpData.xp + bountyXp;
      await tx.routeCompletion.update({
        where: { id: completion.id },
        data: { xpEarned: totalXpEarned },
      });

      return { bountyClaimed: true, bountyXpEarned: bountyXp, totalXpEarned };
    });

    return NextResponse.json({
      message: "Successfully Completed Route",
      status: 200,
      bountyClaimed: completionResult.bountyClaimed,
      bountyXpEarned: completionResult.bountyXpEarned,
      totalXpEarned: completionResult.totalXpEarned,
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

