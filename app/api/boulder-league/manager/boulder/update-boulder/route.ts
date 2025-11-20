import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
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
    const { boulderId, newPoints, newColor, compId, newGrade } = await req.json();

    await prisma.bLBoulder.update({
      where: { id: boulderId as string, competitionId: compId as string },
      data: { points: newPoints, color: newColor, grade: newGrade },
    });

    return NextResponse.json({ message: "Successfully created user" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
