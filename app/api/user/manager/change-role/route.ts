import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "error changing role",
    });
  }
}
