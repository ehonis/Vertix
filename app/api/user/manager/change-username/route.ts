import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, username } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error changing username",
    });
  }
}
