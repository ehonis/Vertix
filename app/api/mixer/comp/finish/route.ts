import { auth } from "@/auth";
import { ClimberStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { compId, climberId } = await req.json();
  try{
    await prisma.mixerClimber.update({
      where: { id: climberId },
      data: { climberStatus: ClimberStatus.COMPLETED },
    });
    return NextResponse.json({ message: "Competition finished" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to finish competition" }, { status: 500 });
  }
}