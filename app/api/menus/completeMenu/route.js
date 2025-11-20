import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { calculateCompletionXpForRoute, getRouteXp } from "@/lib/route";

export async function POST(request) {
  const { userId, routeId, cases, selectedGrade, selectedSends } = await request.json();

  try {
    // Get route information for XP calculation
    const route = await prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Get current completion count for XP calculation
    const existingCompletions = await prisma.routeCompletion.findMany({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    const currentCompletionCount = existingCompletions.length;

    switch (cases) {
      case "completedGraded":
        // Create individual completion records for each send
        for (let i = 0; i < parseInt(selectedSends, 10); i++) {
          const completionNumber = currentCompletionCount + i;
          const xpData = calculateCompletionXpForRoute({
            grade: route.grade,
            previousCompletions: completionNumber,
            newHighestGrade: false, // Already completed, so not new highest
            bonusXp: route.bonusXp || 0,
          });

          await prisma.routeCompletion.create({
            data: {
              userId: userId,
              routeId: routeId,
              xpEarned: xpData.xp,
              completionDate: new Date(),
            },
          });
        }
        break;

      case "completedNotGraded":
        // Create individual completion records for each send
        for (let i = 0; i < parseInt(selectedSends, 10); i++) {
          const completionNumber = currentCompletionCount + i;
          const xpData = calculateCompletionXpForRoute({
            grade: route.grade,
            previousCompletions: completionNumber,
            newHighestGrade: false, // Already completed, so not new highest
            bonusXp: route.bonusXp || 0,
          });

          await prisma.routeCompletion.create({
            data: {
              userId: userId,
              routeId: routeId,
              xpEarned: xpData.xp,
              completionDate: new Date(),
            },
          });
        }

        await prisma.CommunityGrade.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
            grade: selectedGrade,
          },
        });
        break;

      case "notCompletedGraded":
        // First completion - check if new highest grade
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        const isNewHighest =
          route.type === "ROPE"
            ? route.grade > (user.highestRopeGrade || "")
            : route.grade > (user.highestBoulderGrade || "");

        const xpData = calculateCompletionXpForRoute({
          grade: route.grade,
          previousCompletions: 0,
          newHighestGrade: isNewHighest,
          bonusXp: route.xp || 0,
        });

        await prisma.routeCompletion.create({
          data: {
            userId: userId,
            routeId: routeId,
            xpEarned: xpData.xp,
            completionDate: new Date(),
          },
        });

        // Update highest grade if applicable
        if (isNewHighest) {
          const updateData =
            route.type === "ROPE"
              ? { highestRopeGrade: route.grade }
              : { highestBoulderGrade: route.grade };

          await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });
        }
        break;

      case "notCompletedNotGraded":
        // First completion - check if new highest grade
        const user2 = await prisma.user.findUnique({
          where: { id: userId },
        });

        const isNewHighest2 =
          route.type === "ROPE"
            ? route.grade > (user2.highestRopeGrade || "")
            : route.grade > (user2.highestBoulderGrade || "");

        const xpData2 = calculateCompletionXpForRoute({
          grade: route.grade,
          previousCompletions: 0,
          newHighestGrade: isNewHighest2,
          bonusXp: route.bonusXp || 0,
        });

        await prisma.routeCompletion.create({
          data: {
            userId: userId,
            routeId: routeId,
            xpEarned: xpData2.xp,
            completionDate: new Date(),
          },
        });

        await prisma.CommunityGrade.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
            grade: selectedGrade,
          },
        });

        // Update highest grade if applicable
        if (isNewHighest2) {
          const updateData =
            route.type === "ROPE"
              ? { highestRopeGrade: route.grade }
              : { highestBoulderGrade: route.grade };

          await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });
        }
        break;

      default:
        return NextResponse.json({ status: 400 });
    }
    return NextResponse.json({ status: 200 }, { message: "Successfully handled case" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add route to completion", details: error.message },
      { status: 500 }
    );
  }
}
