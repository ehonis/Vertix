import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
    try {
      jwt.verify(token, jwtSecret) as { userId: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        image: true,
        totalXp: true,
        highestRopeGrade: true,
        highestBoulderGrade: true,
        private: true,
      },
    });

    if (!user || user.private) {
      return NextResponse.json(
        { error: "User not found or profile is private" },
        { status: 404 }
      );
    }

    const lastCompletions = await prisma.routeCompletion.findMany({
      where: { userId: targetUserId },
      orderBy: { completionDate: "desc" },
      take: 5,
      select: {
        route: {
          select: { grade: true },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      image: user.image,
      totalXp: user.totalXp,
      highestRopeGrade: user.highestRopeGrade,
      highestBoulderGrade: user.highestBoulderGrade,
      last5Completions: lastCompletions.map((c) => ({ grade: c.route.grade })),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
