import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { ClimberStatus } from "@prisma/client";

export async function POST(req : NextRequest) {
  const session = await auth();
    
    if(!session){
        return NextResponse.json({ message: "Not Authenicated" },{ status: 403 });
    }
    if(session.user.role !== "ADMIN"){
        return NextResponse.json({ message: "Not Authorized" },{ status: 403 });
    }
  try {
    const {
      compId,
      userId,
      name,
      ropeScore,
      boulderScore,
      boulderAttempts,
      ropeAttempts,
      user,
      divisionId,
      entryMethod,
      climberStatus,
    } = await req.json();

    // Convert string values to integers only if they are provided
    let parsedRopeScore = ropeScore !== null ? parseInt(ropeScore, 10) : null;
    let parsedBoulderScore = boulderScore !== null ? parseInt(boulderScore, 10) : null;
    let parsedRopeAttempts = ropeAttempts !== null ? parseInt(ropeAttempts, 10) : null;
    let parsedBoulderAttempts = boulderAttempts !== null ? parseInt(boulderAttempts, 10) : null;

    console.log(parsedRopeScore, parsedBoulderScore, parsedRopeAttempts, parsedBoulderAttempts);
    if(isNaN(parsedRopeScore as number)){
      parsedRopeScore = null;
    }
    if(isNaN(parsedBoulderScore as number)){
      parsedBoulderScore = null;
    }
    if(isNaN(parsedRopeAttempts as number)){
      parsedRopeAttempts = null;
    }
    if(isNaN(parsedBoulderAttempts as number)){
      parsedBoulderAttempts = null;
    }
    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async tx => {
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
      let updatedRopeScore = null;
      if (parsedRopeScore !== null && parsedRopeAttempts !== null) {
        const ropeScoreData = {
          score: parsedRopeScore,
          attempts: parsedRopeAttempts,
        };

        updatedRopeScore = await tx.mixerRopeScore.update({
          where: { climberId: userId },
          data: ropeScoreData,
        });
      }

      // Only update boulder score if both score and attempts are provided
      let updatedBoulderScore = null;
      if (parsedBoulderScore !== null && parsedBoulderAttempts !== null) {
        const boulderScoreData = {
          score: parsedBoulderScore,
          attempts: parsedBoulderAttempts,
        };

        updatedBoulderScore = await tx.mixerBoulderScore.update({
          where: { climberId: userId },
          data: boulderScoreData,
        });
      }

      return {
        climber: climber,
        ropeScore: updatedRopeScore,
        boulderScore: updatedBoulderScore,
      };
    });

    return NextResponse.json({ message: "Successfully Updated user" }, { status: 200 }, );
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
