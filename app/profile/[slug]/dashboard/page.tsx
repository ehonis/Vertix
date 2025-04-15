import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ConstructionBlur from "@/app/ui/general/construction-blur";
import { getCompletionData } from "@/lib/dashboard";
import PyramidGraph from "@/app/ui/profile/dashboard/pyramid-graph";

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

  return (
    <div className="flex flex-col p-5 gap-3 w-screen items-center">
      <ConstructionBlur />
      <h1 className="text-white font-bold text-2xl">{user.name}&apos;s Dashboard</h1>
      <div className="flex w-xs md:w-md">
        <PyramidGraph pyramidData={completionData} />
      </div>
    </div>
  );
}
