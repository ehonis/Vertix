import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

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

    const userId = decoded.userId;

    // Fetch total XP leaderboard (top 100 public users with XP > 0)
    const totalXpLeaderboard = await prisma.user.findMany({
      where: {
        totalXp: {
          gt: 0,
        },
        private: false,
      },
      orderBy: {
        totalXp: "desc",
      },
      take: 100,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalXp: true,
      },
    });

    // Get current month/year for monthly leaderboard
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // Fetch monthly XP leaderboard
    const monthlyXpLeaderboard = await prisma.monthlyXp.findMany({
      where: {
        month: month,
        year: year,
        user: {
          private: false,
        },
      },
      orderBy: {
        xp: "desc",
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            totalXp: true,
          },
        },
        xp: true,
      },
    });

    // Find user's rank in total leaderboard
    const userTotalRank = totalXpLeaderboard.findIndex(u => u.id === userId);
    
    // Find user's rank in monthly leaderboard
    const userMonthlyRank = monthlyXpLeaderboard.findIndex(entry => entry.user.id === userId);

    return NextResponse.json({
      monthly: monthlyXpLeaderboard,
      total: totalXpLeaderboard,
      userMonthlyRank: userMonthlyRank === -1 ? null : userMonthlyRank,
      userTotalRank: userTotalRank === -1 ? null : userTotalRank,
      currentMonth: today.toLocaleString("default", { month: "short" }),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

