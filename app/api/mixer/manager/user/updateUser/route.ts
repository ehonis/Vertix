import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
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
    } = await req.json();

    // Convert string values to integers
    const parsedRopeScore = parseInt(ropeScore, 10);
    const parsedBoulderScore = parseInt(boulderScore, 10);
    const parsedRopeAttempts = parseInt(ropeAttempts, 10);
    const parsedBoulderAttempts = parseInt(boulderAttempts, 10);

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

      // Create rope score
      const ropeScoreData = {
        score: parsedRopeScore,
        attempts: parsedRopeAttempts,
      };

      const updatedRopeScore = await tx.mixerRopeScore.update({
        where: { climberId: userId },
        data: ropeScoreData,
      });

      // Create boulder score
      const boulderScoreData = {
        score: parsedBoulderScore,
        attempts: parsedBoulderAttempts,
      };

      const updatedBoulderScore = await tx.mixerBoulderScore.update({
        where: { climberId: userId },
        data: boulderScoreData,
      });

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
