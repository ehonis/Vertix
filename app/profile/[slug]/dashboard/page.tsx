import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ConstructionBlur from "@/app/ui/general/construction-blur";
import { getCompletionData, getAttemptsData } from "@/lib/dashboard";
import PyramidGraph from "@/app/ui/profile/dashboard/pyramid-graph";
import TypePieChart from "@/app/ui/profile/dashboard/type-pie-chart";
import GradeCompletionsOverTime from "@/app/ui/profile/dashboard/grade-completions-over-time";
import ActivityGraph from "@/app/ui/profile/dashboard/activity-graph";
import ImageNamePlate from "@/app/ui/profile/profile-page/image-name-plate";

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
    <div className="flex flex-col p-5 gap-3 w-screen items-center">
      {/* {session.user.role !== "ADMIN" && <ConstructionBlur />} */}
      <ImageNamePlate
        image={user.image}
        name={user.name}
        username={user.username}
        title={user.tag}
        id={user.id}
        highestRopeGrade={user.highestRopeGrade}
        highestBoulderGrade={user.highestBoulderGrade}
      />
      <div className="flex flex-col w-xs md:w-md gap-2">
        <h2 className="font-barlow text-white text-2xl font-bold">Completions</h2>
        <PyramidGraph completionData={completionData} />
        <div className="flex flex-row gap-2">
          <TypePieChart completionData={completionData} />
          <GradeCompletionsOverTime completionData={completionData} />
        </div>

        <ActivityGraph completionData={completionData} attemptsData={attemptsData} />
      </div>
    </div>
  );
}
