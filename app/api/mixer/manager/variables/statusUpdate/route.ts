import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CompetitionStatus } from "@/generated/prisma/client";
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }
  try {
    const { compId, statusOption } = await req.json();
    if (statusOption === CompetitionStatus.IN_PROGRESS) {
      await prisma.mixerCompetition.update({
        where: { id: compId },
        data: {
          status: statusOption,
          startedAt: new Date(),
        },
      });
    } else {
      await prisma.mixerCompetition.update({
        where: { id: compId },
        data: {
          status: statusOption,
        },
      });
    }
    return NextResponse.json({ message: "Successfully updated status" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error updating status in api" }, { status: 500 });
  }
}
