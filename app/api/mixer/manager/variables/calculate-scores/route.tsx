import prisma from "@/prisma";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

import {
  filterCompletionsByType,
  groupByCompletionsClimberId,
  findTwoHighestRopeScoresPerClimber,
  findThreeHighestBoulderScoresPerClimber,
  combineTwoHighestRopeScoresPerClimberWithAttempts,
  combineThreeHighestBoulderScoresPerClimberWithAttempts,
} from "@/lib/mixers";

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
    const usersWithCompletions = await prisma.mixerCompletion.findMany({
      where: { competitionId: compId },
    });

    const groupedByClimberId = groupByCompletionsClimberId(usersWithCompletions);

    const twoHighestRopeScoresPerClimber = findTwoHighestRopeScoresPerClimber(groupedByClimberId);

    const threeHighestBoulderScoresPerClimber =
      findThreeHighestBoulderScoresPerClimber(groupedByClimberId);

    const twoHighestRopeScoresPerClimberWithAttempts =
      combineTwoHighestRopeScoresPerClimberWithAttempts(twoHighestRopeScoresPerClimber);

    const threeHighestBoulderScoresPerClimberWithAttempts =
      combineThreeHighestBoulderScoresPerClimberWithAttempts(threeHighestBoulderScoresPerClimber);

    const updateUsersRopeScores = async () => {
      for (const climber of twoHighestRopeScoresPerClimberWithAttempts) {
        await prisma.mixerRopeScore.upsert({
          where: {
            climberId: climber.climberId,
            competitionId: compId,
          },
          update: {
            score: climber.points,
            attempts: climber.attempts,
          },
          create: {
            climberId: climber.climberId,
            score: climber.points,
            attempts: climber.attempts,
            competitionId: compId,
          },
        });
      }
    };
    const updateUsersBoulderScores = async () => {
      for (const climber of threeHighestBoulderScoresPerClimberWithAttempts) {
        await prisma.mixerBoulderScore.upsert({
          where: {
            climberId: climber.climberId,
            competitionId: compId,
          },
          update: {
            score: climber.points,
            attempts: climber.attempts,
          },
          create: {
            climberId: climber.climberId,
            score: climber.points,
            attempts: climber.attempts,
            competitionId: compId,
          },
        });
      }
    };
    await prisma.$transaction(async tx => {
      await updateUsersRopeScores();
      await updateUsersBoulderScores();
    });
    await prisma.mixerCompetition.update({
      where: { id: compId },
      data: {
        hasScoresBeenCalculated: true,
      },
    });

    return NextResponse.json({ data: "placeholderData" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "failed in api" }, { status: 200 });
  }
}
