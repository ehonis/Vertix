import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { newImage, userId } = await req.json();
    await prisma.User.update({
      where: { id: userId },
      data: {
        image: newImage,
      },
    });

    return NextResponse.json({ message: "Successfully added Image" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { message: "error adding/updating image in api" });
  }
}
