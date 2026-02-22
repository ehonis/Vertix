import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { RouteType } from "@/generated/prisma/client";
import {
  getGradeIndex,
  type GradeType,
  BOULDER_GRADES_ORDERED,
  ROPE_GRADES_ORDERED,
} from "@/lib/grades";

function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function getYearBounds(year: number): { start: Date; end: Date } {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      "your-secret-key-change-in-production";
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret) as { userId: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(req.url);
    const typeParam = (searchParams.get("type") ?? "boulder").toLowerCase();
    const periodParam = (searchParams.get("period") ?? "monthly").toLowerCase();
    const type: GradeType =
      typeParam === "rope" ? "rope" : "boulder";
    const period: "monthly" | "yearly" =
      periodParam === "yearly" ? "yearly" : "monthly";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const { start: dateFrom, end: dateTo } =
      period === "monthly"
        ? getMonthBounds(year, month)
        : getYearBounds(year);

    const routeType: RouteType = type === "boulder" ? RouteType.BOULDER : RouteType.ROPE;

    const completions = await prisma.routeCompletion.findMany({
      where: {
        completionDate: { gte: dateFrom, lte: dateTo },
        user: { private: false },
        route: {
          type: routeType,
        },
      },
      select: {
        userId: true,
        route: {
          select: { grade: true },
        },
      },
    });

    type GradeCount = Record<string, number>;
    const byUser = new Map<string, GradeCount>();
    for (const c of completions) {
      const grade = c.route.grade;
      const index = getGradeIndex(grade, type);
      if (index === null) continue;
      const normalized =
        type === "boulder"
          ? BOULDER_GRADES_ORDERED[index]
          : ROPE_GRADES_ORDERED[index];
      const counts = byUser.get(c.userId) ?? {};
      counts[normalized] = (counts[normalized] ?? 0) + 1;
      byUser.set(c.userId, counts);
    }

    const orderedGrades: string[] =
      type === "boulder" ? [...BOULDER_GRADES_ORDERED] : [...ROPE_GRADES_ORDERED];

    type Entry = {
      userId: string;
      gradePoints: number;
      topGradeIndex: number;
      topGradeCount: number;
      gradeCounts: GradeCount;
    };

    const entries: Entry[] = [];
    for (const [uid, gradeCounts] of Array.from(byUser.entries())) {
      let gradePoints = 0;
      for (let i = 0; i < orderedGrades.length; i++) {
        const g = orderedGrades[i];
        const count = gradeCounts[g] ?? 0;
        gradePoints += count * Math.pow(3, i);
      }
      const sortedByIndex = orderedGrades
        .filter((g) => (gradeCounts[g] ?? 0) > 0)
        .map((g) => ({
          grade: g,
          index: orderedGrades.indexOf(g),
          count: gradeCounts[g] ?? 0,
        }))
        .sort((a, b) => b.index - a.index);
      const topGradeIndex = sortedByIndex[0]?.index ?? -1;
      const topGradeCount = sortedByIndex[0]?.count ?? 0;
      entries.push({
        userId: uid,
        gradePoints,
        topGradeIndex,
        topGradeCount,
        gradeCounts: { ...gradeCounts },
      });
    }

    entries.sort((a, b) => {
      if (b.gradePoints !== a.gradePoints) return b.gradePoints - a.gradePoints;
      if (b.topGradeIndex !== a.topGradeIndex)
        return b.topGradeIndex - a.topGradeIndex;
      return b.topGradeCount - a.topGradeCount;
    });

    const userIds = entries.map((e) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalXp: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const topGradesFor = (gradeCounts: GradeCount): { grade: string; count: number }[] => {
      const sorted = orderedGrades
        .filter((g: string) => (gradeCounts[g] ?? 0) > 0)
        .map((g: string) => ({ grade: g, count: gradeCounts[g] ?? 0 }))
        .sort(
          (a, b) =>
            orderedGrades.indexOf(b.grade) - orderedGrades.indexOf(a.grade)
        )
        .slice(0, 2);
      return sorted;
    };

    const userRankIdx = entries.findIndex((e) => e.userId === userId);
    const userRank = userRankIdx === -1 ? null : userRankIdx;

    const response = {
      entries: entries
        .map((e) => {
          const user = userMap.get(e.userId);
          if (!user) return null;
          return {
            user,
            gradePoints: e.gradePoints,
            topGrades: topGradesFor(e.gradeCounts),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null),
      userRank,
      currentMonth: today.toLocaleString("default", { month: "short" }),
      period,
      type,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching grade-points leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
