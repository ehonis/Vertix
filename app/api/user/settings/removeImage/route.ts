import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUserProfileImage(userId);

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        image: null,
      },
    });

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding/updating image in api" }, { status: 500 });
  }
}
