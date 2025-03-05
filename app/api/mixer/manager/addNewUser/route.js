import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(request) {
  try {
    const {
      compId,
      name,
      ropeScore,
      boulderScore,
      boulderAttempts,
      ropeAttempts,
      user,
    } = await request.json();

    // Convert string values to integers
    const parsedRopeScore = parseInt(ropeScore, 10);
    const parsedBoulderScore = parseInt(boulderScore, 10);
    const parsedRopeAttempts = parseInt(ropeAttempts, 10);
    const parsedBoulderAttempts = parseInt(boulderAttempts, 10);

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the climber first
      const climberData = {
        competition: {
          connect: {
            id: compId,
          },
        },
        name,
      };

      // Add user connection if a user is provided
      if (user) {
        climberData.user = {
          connect: {
            id: user.id,
          },
        };
      }

      const newClimber = await tx.mixerClimber.create({
        data: climberData,
      });

      // Create rope score
      const ropeScoreData = {
        climber: {
          connect: {
            id: newClimber.id,
          },
        },
        score: parsedRopeScore,
        attempts: parsedRopeAttempts,
        competition: {
          connect: {
            id: compId,
          },
        },
      };

      const createdRopeScore = await tx.mixerRopeScore.create({
        data: ropeScoreData,
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

      const createdBoulderScore = await tx.mixerBoulderScore.create({
        data: boulderScoreData,
      });

      return {
        climber: newClimber,
        ropeScore: createdRopeScore,
        boulderScore: createdBoulderScore,
      };
    });

    return NextResponse.json({
      status: 200,
      message: 'Successfully created user',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
