import { NextResponse, NextRequest } from "next/server";
import prisma from "@/prisma";
import { CompletionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const compId = searchParams.get("compId");

  if (compId === null) {
    return NextResponse.json({ message: "Comp doesnt exist" }, { status: 500 });
  }

  try {
    const [completionData, signUpData, routeData, boulderData] = await Promise.all([
      prisma.mixerCompletion.findMany({
        where: { competitionId: compId },
        orderBy: {
          completionDate: "asc",
        },
      }),

      prisma.mixerClimber.findMany({
        where: { competitionId: compId },
        orderBy: {
          registeredAt: "asc",
        },
        select: {
          id: true,
          name: true,
          registeredAt: true,
        },
      }),

      prisma.mixerRoute.findMany({
        where: { competitionId: compId },
      }),

      prisma.mixerBoulder.findMany({
        where: { competitionId: compId },
      }),
    ]);
    const routeKeyValues = routeData.map(item => {
      return {
        routeId: item.id,
        routeName: item.name,
      };
    });
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
      if (item.type === CompletionType.BOULDER) {
        const boulderName = boulderKeyValues.find(
          boulder => boulder.boulderId === item.mixerBoulderId
        )?.boulderName;
        return {
          id: createNewId(),
          climberId: item.climberId,
          type: "BOULDER_COMPLETION",
          climberName: climberName,
          boulderName: boulderName,
          attempts: item.attempts,
          date: item.completionDate,
        };
      } else {
        const routeName = routeKeyValues.find(
          route => route.routeId === item.mixerRouteId
        )?.routeName;
        return {
          id: createNewId(),
          climberId: item.climberId,
          type: "ROPE_COMPLETION",
          climberName: climberName,
          routeName: routeName,
          attempts: item.attempts,
          date: item.completionDate,
        };
      }
    });

    const formattedSignUpData = signUpData.map(item => {
      return {
        id: createNewId(),
        climberId: item.id,
        type: "SIGN_UP",
        climberName: item.name,
        date: item.registeredAt,
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
