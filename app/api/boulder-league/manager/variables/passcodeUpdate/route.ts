import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { compId, compPasscode } = await req.json();
    await prisma.bLCompetition.update({
      where: { id: compId },
      data: { passcode: compPasscode },
    });
    return NextResponse.json({ message: "Passcode updated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
