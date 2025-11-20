import prisma from "@/prisma";
import TVSlider from "../ui/tv/tv-slider";
import { getAllGradeCounts } from "@/lib/homepage";

export default async function TV() {
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

  return (
    <div className="fixed inset-0 overflow-hidden">
      <TVSlider
        slides={slides}
        monthlyLeaderBoardData={monthlyLeaderBoardData}
        boulderGradeCounts={boulderGradeCounts}
        ropeGradeCounts={ropeGradeCounts}
        ropeTotal={ropeTotal}
        boulderTotal={boulderTotal}
      />
    </div>
  );
}
