import prisma from "@/prisma";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { climberId, compId, type, mixerBoulderId, attempts, points, isComplete } =
    await req.json();

  if (!climberId || !compId || !type || !mixerBoulderId || !attempts || !points || !isComplete) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const completion = await prisma.mixerCompletion.create({
      data: {
        climberId,
        competitionId: compId,
        type,
        mixerBoulderId,
        attempts,
        points,
        isComplete,
      },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create completion" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchParams = req.nextUrl.searchParams;

  const climberId = searchParams.get("climberId");

  const mixerBoulderId = searchParams.get("mixerBoulderId");

  if (!climberId || !mixerBoulderId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await prisma.mixerCompletion.delete({
      where: {
        climberId_mixerBoulderId: {
          climberId: climberId,
          mixerBoulderId: mixerBoulderId,
        },
      },
    });
    return NextResponse.json({ message: "Completion deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete completion" }, { status: 500 });
  }
}
