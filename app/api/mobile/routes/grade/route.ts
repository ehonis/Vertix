import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
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

    const { routeId, selectedGrade } = await request.json();
    const userId = decoded.userId;

    const communityGrade = await prisma.communityGrade.upsert({
      where: { userId_routeId: { userId: userId, routeId: routeId } },
      update: { grade: selectedGrade },
      create: { userId: userId, routeId: routeId, grade: selectedGrade },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error grading route:", error);
    return NextResponse.json({ status: 500 });
  }
}

