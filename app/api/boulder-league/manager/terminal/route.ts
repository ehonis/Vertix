import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";

import { v4 as uuidv4 } from "uuid";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const compId = searchParams.get("compId");

  if (compId === null) {
    return NextResponse.json({ message: "Comp doesnt exist" }, { status: 500 });
  }

  try {
    const [completionData, signUpData, boulderData] = await Promise.all([
      prisma.bLCompletion.findMany({
        where: { competitionId: compId },
        orderBy: {
          completionDate: "asc",
        },
      }),

      prisma.bLClimber.findMany({
        where: { competitionId: compId },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      prisma.bLBoulder.findMany({
        where: { competitionId: compId },
      }),
    ]);

    const boulderKeyValues = boulderData.map(item => {
      return {
        boulderId: item.id,
        boulderName: item.points,
      };
    });

    const climberKeyValues = signUpData.map(item => {
      return {
        climberId: item.id,
        climberName: item.name,
      };
    });

    const createNewId = () => {
      return uuidv4();
    };

    const formattedCompletionData = completionData.map(item => {
      const climberName = climberKeyValues.find(
        climber => climber.climberId === item.climberId
      )?.climberName;

      const boulderName = boulderKeyValues.find(
        boulder => boulder.boulderId === item.boulderId
      )?.boulderName;
      return {
        id: createNewId(),
        climberId: item.climberId,
        climberName: climberName,
        boulderName: boulderName,
        attempts: item.attempts,
        date: item.completionDate,
      };
    });

    const formattedSignUpData = signUpData.map(item => {
      return {
        id: createNewId(),
        climberId: item.id,
        type: "SIGN_UP",
        climberName: item.name,
        date: item.createdAt,
      };
    });

    const combinedData = [...formattedCompletionData, ...formattedSignUpData];

    const sortedData = combinedData.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - b.date?.getTime();
      } else {
        return 0;
      }
    });

    return NextResponse.json({ data: sortedData }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "error inside api" }, { status: 500 });
  }
}
