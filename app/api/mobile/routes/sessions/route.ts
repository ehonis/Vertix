import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";
import { CompetitionType, SessionStatus, SessionType } from "@/generated/prisma/client";
const MAX_SESSIONS_PER_DAY = 4;

function getUserIdFromAuthHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const jwtSecret =
    process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-secret-key-change-in-production";

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

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

function isValidCompPair(isCompetition?: boolean, competitionType?: string, competitionId?: string) {
  const hasType = Boolean(competitionType);
  const hasId = Boolean(competitionId);
  const isComp = Boolean(isCompetition || hasType || hasId);
  const hasPair = hasType && hasId;
  return { isComp, hasPair };
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or missing auth token" }, { status: 401 });
    }

    const activeSession = await prisma.climbingSession.findFirst({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
      include: {
        _count: {
          select: { completions: true },
        },
      },
    });

    return NextResponse.json({ data: activeSession });
  } catch (error) {
    console.error("Get active session error:", error);
    return NextResponse.json({ error: "Failed to fetch active session" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or missing auth token" }, { status: 401 });
    }

    const {
      type,
      name,
      startedAt,
      sessionDate,
      timeSlot,
      isRetroactive,
      isCompetition,
      competitionType,
      competitionId,
      timezoneOffsetMinutes,
    } = await req.json();

    if (type && !Object.values(SessionType).includes(type as SessionType)) {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }

    const { isComp, hasPair } = isValidCompPair(isCompetition, competitionType, competitionId);
    if (isComp && !hasPair) {
      return NextResponse.json(
        { error: "competitionType and competitionId are required together for competition sessions" },
        { status: 400 }
      );
    }

    if (competitionType && !Object.values(CompetitionType).includes(competitionType as CompetitionType)) {
      return NextResponse.json({ error: "Invalid competition type" }, { status: 400 });
    }

    const existingActive = await prisma.climbingSession.findFirst({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      orderBy: { startedAt: "desc" },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: "An active session already exists", data: existingActive },
        { status: 409 }
      );
    }

    const startDate = startedAt ? new Date(startedAt) : new Date();
    const tzOffset =
      typeof timezoneOffsetMinutes === "number" && Number.isFinite(timezoneOffsetMinutes)
        ? timezoneOffsetMinutes
        : 0;
    const { dayStart, dayEnd } = getLocalDayBounds(startDate, tzOffset);

    const sessionsTodayCount = await prisma.climbingSession.count({
      where: {
        userId,
        sessionDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (sessionsTodayCount >= MAX_SESSIONS_PER_DAY) {
      return NextResponse.json({ error: "Daily session limit reached" }, { status: 409 });
    }

    const created = await prisma.climbingSession.create({
      data: {
        userId,
        type: (type as SessionType) ?? SessionType.AUTO,
        name: typeof name === "string" ? name : null,
        status: SessionStatus.ACTIVE,
        startedAt: startDate,
        sessionDate: sessionDate ? new Date(sessionDate) : startDate,
        lastActivityAt: startDate,
        timeSlot: typeof timeSlot === "string" ? timeSlot : null,
        isRetroactive: Boolean(isRetroactive),
        isCompetition: isComp,
        competitionType: hasPair ? (competitionType as CompetitionType) : null,
        competitionId: hasPair ? competitionId : null,
      },
    });

    return NextResponse.json({ data: created, message: "Session started" });
  } catch (error) {
    console.error("Start session error:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or missing auth token" }, { status: 401 });
    }

    const {
      sessionId,
      type,
      name,
      status,
      endedAt,
      sessionDate,
      timeSlot,
      isRetroactive,
      isCompetition,
      competitionType,
      competitionId,
      bumpActivity,
    } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (type && !Object.values(SessionType).includes(type as SessionType)) {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }

    if (status && !Object.values(SessionStatus).includes(status as SessionStatus)) {
      return NextResponse.json({ error: "Invalid session status" }, { status: 400 });
    }

    const { isComp, hasPair } = isValidCompPair(isCompetition, competitionType, competitionId);
    if (isComp && !hasPair) {
      return NextResponse.json(
        { error: "competitionType and competitionId are required together for competition sessions" },
        { status: 400 }
      );
    }

    if (competitionType && !Object.values(CompetitionType).includes(competitionType as CompetitionType)) {
      return NextResponse.json({ error: "Invalid competition type" }, { status: 400 });
    }

    const existing = await prisma.climbingSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updated = await prisma.climbingSession.update({
      where: { id: sessionId },
      data: {
        type: type ? (type as SessionType) : undefined,
        name: typeof name === "string" ? name : undefined,
        status: status ? (status as SessionStatus) : undefined,
        endedAt: endedAt ? new Date(endedAt) : status === SessionStatus.COMPLETED ? new Date() : undefined,
        sessionDate: sessionDate ? new Date(sessionDate) : undefined,
        timeSlot: typeof timeSlot === "string" ? timeSlot : undefined,
        isRetroactive: typeof isRetroactive === "boolean" ? isRetroactive : undefined,
        isCompetition: typeof isCompetition === "boolean" ? isCompetition : undefined,
        competitionType: hasPair ? (competitionType as CompetitionType) : undefined,
        competitionId: hasPair ? competitionId : undefined,
        lastActivityAt: bumpActivity ? new Date() : undefined,
      },
    });

    return NextResponse.json({ data: updated, message: "Session updated" });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
