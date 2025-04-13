import MixerScoreScroller from "@/app/ui/competitions/mixer/scroller/score-scroller";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { useNotification } from "@/app/contexts/NotificationContext";
import { redirect } from "next/navigation";
import { ClimberStatus, MixerCompetition, MixerClimber } from "@prisma/client";

export default async function Mixer({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
  }

  const compId = (await params).slug;
  // Fetch competition data, climber info, routes, and boulders in parallel for better performance
  const [comp, climber, routes, boulders] = await Promise.all([
    // Get competition details
    prisma.mixerCompetition.findUnique({
      where: { id: compId },
    }),

    // Get climber info for current user
    prisma.mixerClimber.findFirst({
      where: {
        competitionId: compId,
        userId: user?.id,
      },
    }),

    // Get all routes sorted by name
    prisma.mixerRoute.findMany({
      where: { competitionId: compId },
      orderBy: {
        name: "asc",
      },
    }),

    // Get all boulders sorted by points
    prisma.mixerBoulder.findMany({
      where: { competitionId: compId },
      orderBy: {
        points: "asc",
      },
    }),
  ]);
  if (!climber) {
    redirect("/competitions/mixer/" + compId + "/signup");
  }

  if (climber?.climberStatus === ClimberStatus.COMPLETED) {
    redirect("/competitions/mixer/" + compId + "/leaderboard");
  }

  if (climber.climberStatus === ClimberStatus.IN_PROGRESS) {
    await prisma.mixerClimber.update({
      where: { id: climber.id },
      data: { climberStatus: ClimberStatus.COMPLETED },
    });
  }

  const boulderCompletions = await prisma.mixerCompletion.findMany({
    where: {
      competitionId: compId,
      climberId: climber?.id,
      type: "BOULDER",
    },
  });

  const ropeCompletions = await prisma.mixerCompletion.findMany({
    where: {
      competitionId: compId,
      climberId: climber?.id,
      type: "ROPE",
    },
  });

  type routeHold = {
    holdNumber: number;
    topRopePoints: number;
    leadPoints: number;
  };
  const parsedData = routes.map(route => ({
    ...route, // Spread the route object
    holds: JSON.parse(route.holds as string) as routeHold[], // Parse the holds string
  }));

  return (
    <>
      <MixerScoreScroller
        comp={comp as MixerCompetition}
        mixerRoutes={parsedData}
        mixerBoulders={boulders}
        climber={climber as MixerClimber}
        boulderCompletions={boulderCompletions}
        ropeCompletions={ropeCompletions}
      />
    </>
  );
}
