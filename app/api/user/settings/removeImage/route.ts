import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUserProfileImage(userId);

    const currentUser = await getCurrentAppUser();
    if (currentUser) {
      await createConvexServerClient().mutation(api.users.updateUserProfile, {
        userId: currentUser.id as any,
        image: null,
      });
    }

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding/updating image in api" }, { status: 500 });
  }
}
