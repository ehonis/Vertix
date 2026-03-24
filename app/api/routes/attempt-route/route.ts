import { NextResponse, NextRequest } from "next/server";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }

  try {
    const { routeId } = await req.json();
    const convex = createConvexServerClient();

    await convex.mutation(api.routes.incrementAttempt, {
      userId: session.user.id as any,
      routeId,
    });

    return NextResponse.json({
      message: "Successfully Attempting Route",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error attempting route in api" }, { status: 500 });
  }
}
