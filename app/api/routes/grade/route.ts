import { NextRequest, NextResponse } from "next/server";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }

  const { routeId, selectedGrade } = await request.json();

  try {
    const convex = createConvexServerClient();
    await convex.mutation(api.routes.upsertCommunityGrade, {
      userId: session.user.id as any,
      routeId,
      selectedGrade,
    });

    return NextResponse.json({ status: 200 });
  } catch {
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
}
