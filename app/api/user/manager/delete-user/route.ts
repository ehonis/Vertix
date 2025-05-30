import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error deleting user",
    });
  }
}
