import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { announcementId } = await req.json();

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    // Mark announcement as seen
    await prisma.userAnnouncement.create({
      data: {
        userId: session.user.id!,
        announcementId: announcementId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing announcement:", error);
    return NextResponse.json({ error: "Failed to dismiss announcement" }, { status: 500 });
  }
}
