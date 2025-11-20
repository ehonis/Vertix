import { NextResponse } from "next/server";
import prisma from "@/prisma";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const take = searchParams.get("take");

  if (!search) {
    return NextResponse.json({ error: "Search parameter is required" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: {
      name: { contains: search, mode: "insensitive" },
      username: { contains: search, mode: "insensitive" },
    },
    take: take ? parseInt(take) : 10,
  });

  return NextResponse.json(
    { data: users, hasMore: users.length === parseInt(take || "10") ? true : false },
    { status: 200 }
  );
}
