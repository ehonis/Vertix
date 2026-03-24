import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get("text") || "";
    const userId = searchParams.get("userId");
    const takeStr = searchParams.get("take");
    const skipStr = searchParams.get("skip");

    const parsedTake = takeStr ? parseInt(takeStr, 10) : 10;
    const parsedSkip = skipStr ? parseInt(skipStr, 10) : 0;

    const convex = createConvexServerClient();
    const result = await convex.query(api.routes.searchRoutes, {
      text: searchTerm,
      take: parsedTake,
      skip: parsedSkip,
      viewerUserId: userId ?? undefined,
    } as any);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ message: "An error occurred", status: 500 }, { status: 500 });
  }
}
