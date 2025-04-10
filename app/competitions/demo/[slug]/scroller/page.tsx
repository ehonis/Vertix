import MixerScoreScroller from "@/app/ui/competitions/demo/mixer-demo/scroller/mixer-score-scroller";
import prisma from "@/prisma";

export default async function Mixer({ params }: { params: Promise<{ slug: string }> }) {
  const compId = (await params).slug;
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
      <MixerScoreScroller mixerRoutes={parsedData} mixerBoulders={boulders} />
    </>
  );
}
