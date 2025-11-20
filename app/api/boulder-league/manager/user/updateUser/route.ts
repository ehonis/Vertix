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
    const {
      compId,
      userId,
      name,

      boulderScore,
      boulderAttempts,

      user,
      divisionId,
      entryMethod,
      climberStatus,
    } = await req.json();

    // Convert string values to integers only if they are provided

    let parsedBoulderScore = boulderScore !== null ? parseInt(boulderScore, 10) : null;

    let parsedBoulderAttempts = boulderAttempts !== null ? parseInt(boulderAttempts, 10) : null;

    if (isNaN(parsedBoulderScore as number)) {
      parsedBoulderScore = null;
    }
    if (isNaN(parsedBoulderAttempts as number)) {
      parsedBoulderAttempts = null;
    }
    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async tx => {
      // Create the climber first
      const climberData = {
        competition: {
          connect: {
            id: compId,
          },
        },
        name,
        division: {
          connect: {
            id: divisionId,
          },
        },
        entryMethod,
        user,
        climberStatus,
      };

      // Add user connection if a user is provided
      if (user) {
        climberData.user = {
          connect: {
            id: user.id,
          },
        };
      } else if (entryMethod === "MANUAL") {
        climberData.user = {
          disconnect: true,
        };
      }

      const climber = await tx.mixerClimber.update({
        where: { id: userId },
        data: climberData,
      });

      // Only update rope score if both score and attempts are provided

      // Only update boulder score if both score and attempts are provided
      let updatedBoulderScore = null;
      if (parsedBoulderScore !== null && parsedBoulderAttempts !== null) {
        const boulderScoreData = {
          score: parsedBoulderScore,
          attempts: parsedBoulderAttempts,
          competitionId: compId,
        };

        updatedBoulderScore = await tx.mixerBoulderScore.upsert({
          where: { climberId: userId },
          update: boulderScoreData,
          create: {
            ...boulderScoreData,
            climberId: userId,
          },
        });
      }

      return {
        climber: climber,
        boulderScore: updatedBoulderScore,
      };
    });

    return NextResponse.json({ message: "Successfully Updated user" }, { status: 200 });
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "error in api",
      },
      { status: 500 }
    );
  }
}
