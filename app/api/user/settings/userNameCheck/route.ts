import { NextResponse, NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username parameter missing" }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentAppUser();
    const available = await createConvexServerClient().query(api.users.isUsernameAvailable, {
      username,
      excludeUserId: currentUser?.id as any,
    });

    return NextResponse.json({ available });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
