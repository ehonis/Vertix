import MixerScoreScroller from "@/app/ui/competitions/mixer/scroller/score-scroller";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { useNotification } from "@/app/contexts/NotificationContext";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";

export default async function Mixer({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
  }

  const compId = (await params).slug;

  const comp = await prisma.mixerCompetition.findUnique({
    where: { id: compId },
  });
  const climber = await prisma.mixerClimber.findFirst({
    where: { competitionId: compId, userId: user?.id },
  });
  const routes = await prisma.mixerRoute.findMany({
    where: { competitionId: compId },
  });
  const boulders = await prisma.mixerBoulder.findMany({
    where: { competitionId: compId },
  });

  const parsedData = routes.map(route => ({
    ...route, // Spread the route object
    holds: JSON.parse(route.holds as string), // Parse the holds string
  }));

  return (
    <>
      <MixerScoreScroller mixerRoutes={parsedData} mixerBoulders={boulders} user={user as User} />
    </>
  );
}
