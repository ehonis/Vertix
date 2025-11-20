import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const climberId = searchParams.get("climberId");
    const completions = await prisma.bLCompletion.findMany({
      where: {
        climberId: climberId as string,
      },
    });

    return NextResponse.json({ data: completions }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
