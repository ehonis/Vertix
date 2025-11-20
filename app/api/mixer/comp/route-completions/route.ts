import prisma from "@/prisma";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { climberId, compId, type, mixerRouteId, attempts, points, holdNumber, maxHoldNum } =
    await req.json();

  console.log(climberId, compId, type, mixerRouteId, attempts, points, holdNumber, maxHoldNum);
  if (!climberId || !compId || !type || !mixerRouteId || !attempts || !points) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let isComplete = false;

  if (holdNumber === maxHoldNum) {
    isComplete = true;
  }

  try {
    const completion = await prisma.mixerCompletion.create({
      data: {
        climberId,
        competitionId: compId,
        type,
        mixerRouteId,
        attempts,
        points,
        holdNumber,
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

  const mixerRouteId = searchParams.get("mixerRouteId");

  if (!climberId || !mixerRouteId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await prisma.mixerCompletion.delete({
      where: {
        climberId_mixerRouteId: {
          climberId: climberId,
          mixerRouteId: mixerRouteId,
        },
      },
    });
    return NextResponse.json({ message: "Completion deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete completion" }, { status: 500 });
  }
}
