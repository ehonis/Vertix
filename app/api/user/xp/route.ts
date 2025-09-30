import { NextRequest, NextResponse } from "next/server";


import { auth } from "@/auth";

import prisma from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        totalXp: true,
        monthlyXp: {
          where: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          },
          select: {
            xp: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentMonthXp = user.monthlyXp[0]?.xp || 0;

    return NextResponse.json({ 
      xp: user.totalXp || 0,
      monthlyXp: currentMonthXp
    });
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
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
    const result = await prisma.$transaction(async (tx) => {
      // Update total XP
      const updatedUser = await tx.user.update({
        where: { id: session.user.id! },
        data: { totalXp: { increment: xpGained } },
        select: { totalXp: true }
      });

      // Update or create monthly XP record
      await tx.monthlyXp.upsert({
        where: {
          userId_month_year: {
            userId: session.user.id!,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          xp: { increment: xpGained },
        },
        create: {
          userId: session.user.id!,
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
      monthlyXp: xpGained // Return the XP gained this month
    });
  } catch (error) {
    console.error("Error updating user XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
