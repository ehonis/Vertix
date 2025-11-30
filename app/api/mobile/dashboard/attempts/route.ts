import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
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

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
      };

      const attempts = await prisma.routeAttempt.findMany({
        where: { userId: decoded.userId },
        include: {
          route: {
            select: {
              type: true,
              grade: true,
              title: true,
              color: true,
              id: true,
            },
          },
        },
        orderBy: {
          attemptDate: "desc",
        },
      });

      return NextResponse.json({ data: attempts });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Dashboard attempts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts data" },
      { status: 500 }
    );
  }
}

