import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req) {
  try {
    const { divisionName, compId } = await req.json();

    const division = await prisma.MixerDivision.create({
      data: {
        competitionId: compId,
        name: divisionName,
      },
    });
    return NextResponse.json(
      { data: division, message: "Successfully adding division" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { message: "error adding division in api" });
  }
}
