import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username parameter missing" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { username },
    });

    // Return available as true if no user matches.
    return NextResponse.json({ available: !user });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
