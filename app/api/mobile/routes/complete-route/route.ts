import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { CompetitionType, RouteType, SessionStatus, User } from "@prisma/client";
import {
  findIfBoulderGradeIsHigher,
  findIfRopeGradeIsHigher,
  calculateCompletionXpForRoute,
  calculateDynamicBountyXp,
} from "@/lib/route";

const MAX_SESSIONS_PER_DAY = 4;

function getLocalDayBounds(date: Date, timezoneOffsetMinutes: number) {
  const shifted = new Date(date.getTime() - timezoneOffsetMinutes * 60_000);
  const dayStartShifted = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), 0, 0, 0, 0)
  );
  const dayEndShifted = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), 23, 59, 59, 999)
  );

  return {
    dayStart: new Date(dayStartShifted.getTime() + timezoneOffsetMinutes * 60_000),
    dayEnd: new Date(dayEndShifted.getTime() + timezoneOffsetMinutes * 60_000),
  };
}

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

    const {
      routeId,
      flash,
      date,
      sessionId: requestedSessionId,
      isCompetition,
      competitionType,
      competitionId,
      timezoneOffsetMinutes,
    } = await req.json();
    const userId = decoded.userId;
    const completionDate = date ? new Date(date) : new Date();
    const tzOffset =
      typeof timezoneOffsetMinutes === "number" && Number.isFinite(timezoneOffsetMinutes)
        ? timezoneOffsetMinutes
        : 0;

    const hasCompType = typeof competitionType === "string" && competitionType.length > 0;
    const hasCompId = typeof competitionId === "string" && competitionId.length > 0;
    const resolvedIsCompetition = Boolean(isCompetition || hasCompType || hasCompId);

    if ((hasCompType && !hasCompId) || (!hasCompType && hasCompId)) {
      return NextResponse.json(
        { message: "competitionType and competitionId must both be provided together" },
        { status: 400 }
      );
    }

    if (resolvedIsCompetition && (!hasCompType || !hasCompId)) {
      return NextResponse.json(
        { message: "Competition completions require competitionType and competitionId" },
        { status: 400 }
      );
    }

    let resolvedCompetitionType: CompetitionType | null = null;
    if (hasCompType) {
      if (!Object.values(CompetitionType).includes(competitionType as CompetitionType)) {
        return NextResponse.json(
          { message: "Invalid competitionType" },
          { status: 400 }
        );
      }
      resolvedCompetitionType = competitionType as CompetitionType;
    }

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

    const completionResult = await prisma.$transaction(async tx => {
      const { dayStart, dayEnd } = getLocalDayBounds(completionDate, tzOffset);

      let activeSession = requestedSessionId
        ? await tx.climbingSession.findFirst({
            where: {
              id: requestedSessionId,
              userId,
              status: SessionStatus.ACTIVE,
            },
          })
        : null;

      if (!activeSession) {
        activeSession = await tx.climbingSession.findFirst({
          where: {
            userId,
            status: SessionStatus.ACTIVE,
          },
          orderBy: {
            startedAt: "desc",
          },
        });
      }

      if (!activeSession) {
        const sessionsTodayCount = await tx.climbingSession.count({
          where: {
            userId,
            sessionDate: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        if (sessionsTodayCount >= MAX_SESSIONS_PER_DAY) {
          throw new Error("SESSION_DAILY_LIMIT_REACHED");
        }

        activeSession = await tx.climbingSession.create({
          data: {
            userId,
            type: "AUTO",
            status: SessionStatus.ACTIVE,
            startedAt: completionDate,
            lastActivityAt: completionDate,
            sessionDate: completionDate,
            isCompetition: resolvedIsCompetition,
            competitionType: resolvedCompetitionType,
            competitionId: hasCompId ? competitionId : null,
          },
        });
      } else {
        await tx.climbingSession.update({
          where: { id: activeSession.id },
          data: {
            lastActivityAt: completionDate,
            isCompetition: resolvedIsCompetition || activeSession.isCompetition,
            competitionType:
              resolvedCompetitionType ?? activeSession.competitionType ?? null,
            competitionId: (hasCompId ? competitionId : null) ?? activeSession.competitionId ?? null,
          },
        });
      }

      const completion = await tx.routeCompletion.create({
        data: {
          userId: userId,
          routeId: routeId,
          sessionId: activeSession.id,
          xpEarned: xpData.xp,
          completionDate,
          flash: flash || false,
          isCompetition: resolvedIsCompetition,
          competitionType: resolvedCompetitionType,
          competitionId: hasCompId ? competitionId : null,
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
    if (error instanceof Error && error.message === "SESSION_DAILY_LIMIT_REACHED") {
      return NextResponse.json(
        { message: "Daily session limit reached" },
        { status: 409 }
      );
    }

    console.error("Error completing route:", error);
    return NextResponse.json(
      { message: "error completing route in api" },
      {
        status: 500,
      }
    );
  }
}

