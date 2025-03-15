import MixerScoreScroller from '@/app/ui/competitions/mixer/scroller/mixer-score-scroller';
import prisma from '@/prisma';

export default async function Mixer({ params }) {
  const compId = (await params).slug;
  const routes = await prisma.MixerRoute.findMany({
    where: { competitionId: compId },
  });
  const boulders = await prisma.MixerBoulder.findMany({
    where: { competitionId: compId },
  });

  const parsedData = routes.map((route) => ({
    ...route, // Spread the route object
    holds: JSON.parse(route.holds), // Parse the holds string
  }));

  return (
    <>
      <MixerScoreScroller
        mixerRoutes={parsedData}
        mixerBoulders={boulders}
        StartTime={null}
      />
    </>
  );
}
