import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";

import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

// Helper to get userId from JWT token or NextAuth session
async function getUserId(req: NextRequest): Promise<string | null> {
  // First, check for JWT token (mobile authentication)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        return decoded.userId;
      } catch (jwtError) {
        // JWT verification failed, try NextAuth session
      }
    }
  }

  // If no JWT token, check for NextAuth session (web authentication)
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaderboardData = await createConvexServerClient().query(
      api.routes.getLeaderboardData,
      {}
    );
    const user = leaderboardData.total.find(entry => entry.id === userId) ?? null;
    const currentMonthXp = leaderboardData.monthly.find(entry => entry.user.id === userId)?.xp || 0;

    return NextResponse.json({
      xp: user?.totalXp || 0,
      monthlyXp: currentMonthXp,
    });
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { xpGained } = await req.json();

    if (typeof xpGained !== "number") {
      return NextResponse.json({ error: "Invalid XP value" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "XP write endpoint is obsolete under Convex-backed route completion",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error updating user XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
