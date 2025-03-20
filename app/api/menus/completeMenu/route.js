import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { userId, routeId, cases, selectedGrade, selectedSends } = await request.json();

  try {
    switch (cases) {
      case "completedGraded":
        await prisma.routeCompletion.update({
          where: { userId_routeId: { userId, routeId } },
          data: { sends: { increment: parseInt(selectedSends, 10) } },
        });
        break;
      case "completedNotGraded":
        await prisma.routeCompletion.update({
          where: { userId_routeId: { userId, routeId } },
          data: { sends: { increment: parseInt(selectedSends, 10) } },
        });
        await prisma.CommunityGrade.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
            grade: selectedGrade,
          },
        });
        break;
      case "notCompletedGraded":
        await prisma.routeCompletion.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
          },
        });
        break;
      case "notCompletedNotGraded":
        await prisma.routeCompletion.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
          },
        });
        await prisma.CommunityGrade.create({
          data: {
            user: { connect: { id: userId } },
            route: { connect: { id: routeId } },
            grade: selectedGrade,
          },
        });
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
