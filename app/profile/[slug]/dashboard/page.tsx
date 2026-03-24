import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";

import { getCompletionData, getAttemptsData } from "@/lib/dashboard";
import PyramidGraph from "@/app/ui/profile/dashboard/pyramid-graph";
import TypePieChart from "@/app/ui/profile/dashboard/type-pie-chart";
import GradeCompletionsOverTime from "@/app/ui/profile/dashboard/grade-completions-over-time";

import ImageNamePlate from "@/app/ui/profile/dashboard/image-name-plate";
import ActivityFeed from "@/app/ui/profile/dashboard/activity-feed";
import XpLevelDisplay from "@/app/ui/profile/dashboard/xp-level-display";

export const revalidate = 100;

export default async function Dashboard({ params }: { params: Promise<{ slug: string }> }) {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    redirect("/signin");
    return;
  }
  const { slug } = await params;

  if (!slug) {
    redirect("/404");
    return;
  }

  const user = currentUser.username === slug ? currentUser : null;

  if (!user || user.id !== currentUser.id) {
    redirect("/signin");
  }

  const completionData = await getCompletionData(slug);
  const attemptsData = await getAttemptsData(slug);

  return (
    <div className="flex flex-col p-5 gap-2 w-screen items-center">
      {/* {session.user.role !== "ADMIN" && <ConstructionBlur />} */}

      <ImageNamePlate user={user} />

      <div className="flex flex-col w-xs md:w-md gap-3">
        <XpLevelDisplay user={user} />
        <h2 className="font-barlow text-white text-2xl font-bold">Recent Tix & Attempts</h2>
        <ActivityFeed username={slug} />
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
