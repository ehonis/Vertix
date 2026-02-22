import BoulderLeagueScoreScroller from "@/app/ui/competitions/boulder-league/scroller/score-scroller";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  ClimberStatus,
  CompetitionStatus,
  BLCompetition,
  BLClimber,
  BLCompletion,
} from "@/generated/prisma/client";

export default async function Mixer({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
  }

  const compId = (await params).slug;
  // Fetch competition data, climber info, routes, and boulders in parallel for better performance
  const [comp, climber, boulders] = await Promise.all([
    // Get competition details
    prisma.bLCompetition.findUnique({
      where: { id: compId },
    }),

    // Get climber info for current user
    prisma.bLClimber.findFirst({
      where: {
        competitionId: compId,
        userId: user?.id,
      },
    }),

    // Get all boulders sorted by points
    prisma.bLBoulder.findMany({
      where: { competitionId: compId },
      orderBy: {
        points: "asc",
      },
    }),
  ]);
  if (!comp) {
    redirect("/competitions/");
  }
  if (!climber) {
    redirect("/competitions/boulder-league/" + compId + "/signup");
  }

  if (climber?.climberStatus === ClimberStatus.COMPLETED) {
    redirect("/competitions/boulder-league/" + compId + "/leaderboard");
  }

  if (climber.climberStatus === ClimberStatus.NOT_STARTED) {
    await prisma.mixerClimber.update({
      where: { id: climber.id },
      data: { climberStatus: ClimberStatus.IN_PROGRESS },
    });
  }
  if (comp?.status === CompetitionStatus.COMPLETED) {
    redirect("/competitions/mixer/" + compId + "/leaderboard");
  }

  const boulderCompletions = await prisma.bLCompletion.findMany({
    where: {
      competitionId: compId,
      climberId: climber?.id,
    },
  });

  return (
    <>
      <BoulderLeagueScoreScroller
        comp={comp as BLCompetition}
        boulders={boulders}
        climber={climber as BLClimber}
        boulderCompletions={boulderCompletions as BLCompletion[]}
      />
    </>
  );
}
