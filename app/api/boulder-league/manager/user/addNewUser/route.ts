import { NextResponse, NextRequest   } from "next/server";
import prisma from "@/prisma";
import { auth } from "@/auth";
export async function POST(req: NextRequest) {
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
      name,

      boulderScore,
      boulderAttempts,

      user,
      divisionId,
      entryMethod,
      climberStatus,
    } = await req.json();
    // Convert string values to integers

    const parsedBoulderScore = parseInt(boulderScore, 10);

    const parsedBoulderAttempts = parseInt(boulderAttempts, 10);

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
      }

      const newClimber = await tx.bLClimber.create({
        data: climberData,
      });

      // Create boulder score
      const boulderScoreData = {
        climber: {
          connect: {
            id: newClimber.id,
          },
        },
        score: parsedBoulderScore,
        attempts: parsedBoulderAttempts,
        competition: {
          connect: {
            id: compId,
          },
        },
      };

      const createdBoulderScore = await tx.bLBoulderScore.create({
        data: boulderScoreData,
      });

      return {
        climber: newClimber,

        boulderScore: createdBoulderScore,
      };
    });

    return NextResponse.json({ message: "Successfully created user" }, { status: 200 } );
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
