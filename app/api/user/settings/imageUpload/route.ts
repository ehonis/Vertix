import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";



export async function POST(req : NextRequest) {
  try {
    const { newImage, userId } = await req.json();
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: newImage,
      },
    });

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error adding/updating image in api" }, { status: 500 }, );
  }
}
