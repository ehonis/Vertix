import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const take = searchParams.get("take");

  if (!search) {
    return NextResponse.json({ error: "Search parameter is required" }, { status: 400 });
  }

  const users = await createConvexServerClient().query(api.users.searchUsers, {
    search,
    take: take ? parseInt(take) : 10,
  });

  return NextResponse.json(
    { data: users, hasMore: users.length === parseInt(take || "10") ? true : false },
    { status: 200 }
  );
}
