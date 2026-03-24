import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tags = searchParams.get("tags");
    const tagsArray = tags?.split(",").filter(Boolean) ?? [];
    const userId = searchParams.get("userId");

    const convex = createConvexServerClient();
    const routes = await convex.query(api.routes.getTaggedRoutes, {
      tags: tagsArray,
      viewerUserId: userId ?? undefined,
    } as any);

    return NextResponse.json({ data: routes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, message: "error finding route" }, { status: 500 });
  }
}
