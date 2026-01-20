import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { auth } from "@/auth";

import prisma from "@/prisma";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        monthlyXp: {
          where: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
          },
          select: {
            xp: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMonthXp = user.monthlyXp[0]?.xp || 0;

    return NextResponse.json({
      xp: user.totalXp || 0,
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

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Update total XP and monthly XP in a transaction
    const result = await prisma.$transaction(async tx => {
      // Update total XP
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { totalXp: { increment: xpGained } },
        select: { totalXp: true },
      });

      // Update or create monthly XP record
      await tx.monthlyXp.upsert({
        where: {
          userId_month_year: {
            userId: userId,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          xp: { increment: xpGained },
        },
        create: {
          userId: userId,
          month: currentMonth,
          year: currentYear,
          xp: xpGained,
        },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      newTotalXp: result.totalXp,
      monthlyXp: xpGained, // Return the XP gained this month
    });
  } catch (error) {
    console.error("Error updating user XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
