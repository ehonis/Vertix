import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { getCompletionData, getAttemptsData } from "@/lib/dashboard";
import PyramidGraph from "@/app/ui/profile/dashboard/pyramid-graph";
import TypePieChart from "@/app/ui/profile/dashboard/type-pie-chart";
import GradeCompletionsOverTime from "@/app/ui/profile/dashboard/grade-completions-over-time";

import ImageNamePlate from "@/app/ui/profile/dashboard/image-name-plate";
import ActivityFeed from "@/app/ui/profile/dashboard/activity-feed";
import XpLevelDisplay from "@/app/ui/profile/dashboard/xp-level-display";

export const revalidate = 100;

export default async function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
    return;
  }
  const { slug } = await params;

  if (!slug) {
    redirect("/404");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: slug },
  });

  if (!user || user.username !== session?.user?.username) {
    redirect("/signin");
  }

  const completionData = await getCompletionData(user.id);
  const attemptsData = await getAttemptsData(user.id);

  return (
    <div className="flex flex-col p-5 gap-2 w-screen items-center">
      {/* {session.user.role !== "ADMIN" && <ConstructionBlur />} */}

      <ImageNamePlate user={user} />

      <div className="flex flex-col w-xs md:w-md gap-3">
        <XpLevelDisplay user={user} />
        <h2 className="font-barlow text-white text-2xl font-bold">Recent Tix & Attempts</h2>
        <ActivityFeed userId={user.id} />
        <h2 className="font-barlow text-white text-2xl font-bold">Total Tix</h2>
        <PyramidGraph completionData={completionData} />
        <div className="flex flex-row gap-2">
          <TypePieChart completionData={completionData} />
          <GradeCompletionsOverTime completionData={completionData} />
        </div>

        {/* <ActivityGraph completionData={completionData} attemptsData={attemptsData} /> */}
      </div>
    </div>
  );
}
