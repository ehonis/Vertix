import prisma from "@/prisma";

import MixerLeaderBoard from "../../../../ui/competitions/mixer/leaderboard/mixer-leaderboard";
import { auth } from "@/auth";
import ThreeDotLoading from "@/app/ui/general/three-dot-loading";
import { StandingsType } from "@prisma/client";
import { calculateStandings, calculateStandingsWithAverageDownwardMovement } from "@/lib/mixers";
import { ClimberStanding, DivisionStanding, Score } from "@/lib/mixers";

export default async function MixerDemoLeaderboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const comp = await prisma.mixerCompetition.findFirst({
    where: { id: slug },
  });

  if (!comp) {
    return (
      <div className="flex flex-col h-screen-offset justify-center items-center">
        <h1 className="text-white font-barlow font-bold text-xl text-center mb-5">
          Competition Not Found
        </h1>
      </div>
    );
  }

  if (!comp?.areScoresAvailable) {
    return (
      <div className="flex flex-col h-screen-offset justify-center items-center">
        <h1 className="text-white font-barlow font-bold text-xl text-center mb-5">
          You have successfully completed the competition!
        </h1>
        <h2 className="text-white font-barlow font-bold text-3xl text-center">
          Scores Not Yet Available
        </h2>

        <p className="text-white font-barlow font-bold text-sm text-center">
          Please wait until the competition is over and scores are being announced, then refresh.
        </p>
        <ThreeDotLoading />
      </div>
    );
  }

  let combinedScores: ClimberStanding[];
  let ogDivisionStandings: DivisionStanding[];
  let adjustedRankings: DivisionStanding[];
  let boulderScoresRanked: Score[];
  let ropeScoresRanked: Score[];

  if (comp.standingsType === StandingsType.averageDownwardMovement) {
    const {
      boulderScores,
      ropeScores,
      overallStandings,
      originalDivisionStandings,
      adjustedDivisionStandings,
    } = await calculateStandingsWithAverageDownwardMovement(comp.id);
    combinedScores = overallStandings;
    ogDivisionStandings = originalDivisionStandings;
    adjustedRankings = adjustedDivisionStandings;
    boulderScoresRanked = boulderScores;
    ropeScoresRanked = ropeScores;
  } else {
    const {
      boulderScores,
      ropeScores,
      overallStandings,
      originalDivisionStandings,
      adjustedDivisionStandings,
    } = await calculateStandings(comp.id);
    combinedScores = overallStandings;
    ogDivisionStandings = originalDivisionStandings;
    adjustedRankings = adjustedDivisionStandings;
    boulderScoresRanked = boulderScores;
    ropeScoresRanked = ropeScores;
  }

  const session = await auth();
  const user = session?.user || null;

  if (combinedScores.length < 3) {
    return (
      <div className="flex flex-col h-screen-offset justify-center items-center">
        <h1 className="text-white font-barlow font-bold text-xl text-center mb-5">
          Not enough climbers to display leaderboard
        </h1>
      </div>
    );
  }
  // console.log("combinedScores", combinedScores);
  console.log("adjustedRankings", adjustedRankings);
  //   console.log("boulderScoresRanked", boulderScoresRanked);
  //   console.log("ropeScoresRanked", ropeScoresRanked);
  return (
    <>
      <MixerLeaderBoard
        comp={comp}
        user={user}
        combinedScores={combinedScores}
        adjustedRankings={adjustedRankings}
        boulderScoresRanked={boulderScoresRanked}
        ropeScoresRanked={ropeScoresRanked}
        originalDivisionStandings={ogDivisionStandings}
      />
    </>
  );
}
