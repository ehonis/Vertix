import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { getAllGradeCounts } from "@/lib/homepage";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  const month = today.getMonth() + 1;

  const slides = await prisma.tVSlide.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      routes: {
        include: {
          images: true,
        },
      },
    },
  });

  const monthlyLeaderBoardData = await prisma.monthlyXp.findMany({
    where: {
      month: month,
      year: today.getFullYear(),
      user: {
        private: false,
      },
    },
    orderBy: {
      xp: "desc",
    },
    select: {
      user: {
        select: {
          name: true,
          id: true,
          totalXp: true,
          username: true,
          image: true,
        },
      },
      xp: true,
    },
  });

  const routes = await prisma.route.findMany({
    where: { isArchive: false },
  });

  const { boulderGradeCounts, ropeGradeCounts, ropeTotal, boulderTotal } =
    getAllGradeCounts(routes);

  return NextResponse.json({
    slides,
    monthlyLeaderBoardData,
    boulderGradeCounts,
    ropeGradeCounts,
    ropeTotal,
    boulderTotal,
  });
}
