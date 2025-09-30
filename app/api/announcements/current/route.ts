import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ announcement: null });
    }

    // Get the most recent active announcement
    const announcement = await prisma.announcement.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!announcement) {
      return NextResponse.json({ announcement: null });
    }

    // Check if user has seen this announcement
    const userAnnouncement = await prisma.userAnnouncement.findUnique({
      where: {
        userId_announcementId: {
          userId: session.user.id!,
          announcementId: announcement.id,
        },
      },
    });

    // If user has seen it, don't show it
    if (userAnnouncement) {
      return NextResponse.json({ announcement: null });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error fetching current announcement:', error);
    return NextResponse.json({ announcement: null });
  }
}
