import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";

export async function DELETE(req: NextRequest) {
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

    const { completionId } = await req.json();
    const userId = decoded.userId;

    if (!completionId) {
      return NextResponse.json(
        { error: "completionId is required" },
        { status: 400 }
      );
    }

    // Verify the completion belongs to the user
    const completion = await prisma.routeCompletion.findUnique({
      where: { id: completionId },
    });

    if (!completion) {
      return NextResponse.json(
        { error: "Completion not found" },
        { status: 404 }
      );
    }

    if (completion.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the completion
    await prisma.routeCompletion.delete({
      where: { id: completionId },
    });

    return NextResponse.json(
      { message: "Completion deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting completion:", error);
    return NextResponse.json(
      { error: "Failed to delete completion", details: error.message },
      { status: 500 }
    );
  }
}

