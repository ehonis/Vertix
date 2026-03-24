import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ message: "Image file is required" }, { status: 400 });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.updateUserProfileImage(userId, {
      file: image,
    });

    const currentUser = await getCurrentAppUser();
    if (currentUser) {
      await createConvexServerClient().mutation(api.users.updateUserProfile, {
        userId: currentUser.id as any,
        image: clerkUser.imageUrl,
      });
    }

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding/updating image in api" }, { status: 500 });
  }
}
