import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  try {
    const { newImage, compId } = await req.json();
    await prisma.mixerCompetition.update({
      where: { id: compId },
      data: {
        imageUrl: newImage,
      },
    });

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding/updating image in api" }, { status: 500 });
  }
}
