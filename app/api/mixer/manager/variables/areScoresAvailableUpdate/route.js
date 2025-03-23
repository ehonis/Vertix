import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req) {
  try {
    const { compId, isScoresAvailable } = await req.json();
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        areScoresAvailable: isScoresAvailable,
      },
    });

    return NextResponse.json({ message: "Successfully updated comp Name" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { message: "error updating name in api" });
  }
}
