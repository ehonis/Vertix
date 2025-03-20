import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req) {
  try {
    const { compId, compTime } = await req.json();
    const parsedIntTime = parseInt(compTime);
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        time: parsedIntTime,
      },
    });

    return NextResponse.json({ message: "Successfully updated time allotted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { message: "error updating tiem allotted in api" });
  }
}
