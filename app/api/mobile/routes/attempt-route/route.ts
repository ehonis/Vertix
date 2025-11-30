import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
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

    const { routeId } = await req.json();
    const userId = decoded.userId;

    await prisma.routeAttempt.upsert({
      where: {
        userId_routeId: {
          userId: userId,
          routeId: routeId,
        },
      },
      update: {
        attempts: { increment: 1 },
      },
      create: {
        userId: userId,
        routeId: routeId,
      },
    });

    return NextResponse.json({
      message: "Successfully Attempting Route",
      status: 200,
    });
  } catch (error) {
    console.error("Error attempting route:", error);
    return NextResponse.json(
      { message: "error attempting route in api" },
      {
        status: 500,
      }
    );
  }
}

