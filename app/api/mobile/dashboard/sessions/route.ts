import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";
import { SessionStatus } from "@/generated/prisma/client";

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

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromAuthHeader(req);
    if (!userId) {
      return NextResponse.json({ error: "Invalid or missing auth token" }, { status: 401 });
    }

    const sessions = await prisma.climbingSession.findMany({
      where: { userId },
      orderBy: [{ startedAt: "desc" }],
      take: 30,
      include: {
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    const activeSession = sessions.find((session) => session.status === SessionStatus.ACTIVE) ?? null;

    return NextResponse.json({
      data: sessions.map((session) => ({
        id: session.id,
        type: session.type,
        name: session.name,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        sessionDate: session.sessionDate,
        timeSlot: session.timeSlot,
        isRetroactive: session.isRetroactive,
        isCompetition: session.isCompetition,
        competitionType: session.competitionType,
        competitionId: session.competitionId,
        completionCount: session._count.completions,
      })),
      activeSessionId: activeSession?.id ?? null,
    });
  } catch (error) {
    console.error("Dashboard sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
