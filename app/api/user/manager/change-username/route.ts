import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json();

    await createConvexServerClient().mutation(api.users.updateUserProfile, {
      userId,
      username,
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error changing username",
    });
  }
}
