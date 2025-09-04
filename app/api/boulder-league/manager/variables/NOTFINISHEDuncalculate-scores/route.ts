import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";


export async function POST(req: NextRequest) {
  const session = await auth();

  const { compId } = await req.json();

  if (!session) {
    return NextResponse.json({ message: "Not Authenicated" }, { status: 403 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not Authorized" }, { status: 403 });
  }

  try {
    const usersWithCompletions = await prisma.bLCompletion.findMany({
      where: { competitionId: compId },
      select: {
        climberId: true,
      },
    });
    


    const removeBoulderScores = async () => {
      await prisma.bLBoulderScore.deleteMany({
        where: { competitionId: compId, climberId: { in: usersWithCompletions.map(user => user.climberId) } },
      });
    };

    await prisma.$transaction(async () => {

      await removeBoulderScores();
    });
    await prisma.bLCompetition.update({
      where: { id: compId },
      data: {
        hasScoresBeenCalculated: false,
      },
    });
    return NextResponse.json({ data: "placeholderData" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "failed in api" }, { status: 200 });
  }
}
