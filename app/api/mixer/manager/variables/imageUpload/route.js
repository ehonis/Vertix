import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req) {
  try {
    const { newImage, compId } = await req.json();
    await prisma.MixerCompetition.update({
      where: { id: compId },
      data: {
        imageUrl: newImage,
      },
    });

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { message: "error adding/updating image in api" });
  }
}
