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
    const { routeId, flash, date } = await req.json();
    const convex = createConvexServerClient();

    await convex.mutation(api.routes.completeRoute, {
      userId: session.user.id as any,
      routeId,
      flash: Boolean(flash),
      completedAt: date ? new Date(date).getTime() : undefined,
    });

    return NextResponse.json({
      message: "Successfully Completed Route",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error completing route in api" }, { status: 500 });
  }
}
