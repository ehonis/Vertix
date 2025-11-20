import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }
  try {
    const { compId, dateObject } = await req.json();
    console.log(typeof dateObject);
    const parsedDate = new Date(dateObject);
    console.log();

    await prisma.mixerCompetition.update({
      where: { id: compId },
      data: {
        compDay: parsedDate,
      },
    });

    return NextResponse.json({ message: "Successfully updated time allotted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error updating time allotted in api" }, { status: 500 });
  }
}
