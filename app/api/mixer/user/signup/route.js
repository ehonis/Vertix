import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req) {
  const { userId, climberName, selectedDivision, compId } = await req.json();
  console.log(userId, climberName, selectedDivision, compId);
  try {
    const climber = await prisma.MixerClimber.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        name: climberName,
        division: {
          connect: {
            id: selectedDivision,
          },
        },
        entryMethod: "APP",
        competition: {
          connect: {
            id: compId,
          },
        },
      },
    });
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
