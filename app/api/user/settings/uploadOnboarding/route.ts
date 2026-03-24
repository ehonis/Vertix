import { NextResponse, NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function POST(req: NextRequest) {
  const { id, name, username, tag, privacy } = await req.json();

  const updatedUser = await createConvexServerClient().mutation(api.users.updateUserProfile, {
    userId: id,
    name,
    username,
    private: privacy,
    isOnboarded: true,
  });
  return NextResponse.json({ ...updatedUser, tag });
}
