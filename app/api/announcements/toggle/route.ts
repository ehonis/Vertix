import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to toggle announcements
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, isActive } = await req.json();

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "ID and isActive are required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error toggling announcement:", error);
    return NextResponse.json({ error: "Failed to toggle announcement" }, { status: 500 });
  }
}
