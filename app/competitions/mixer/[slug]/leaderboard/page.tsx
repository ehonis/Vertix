import prisma from "@/prisma";
import { formatMixerDataFromDatabase, calculateScores } from "@/lib/mixer";
import { unstable_cache } from "next/cache";
import MixerLeaderBoard from "../../../../ui/competitions/mixer/leaderboard/mixer-leaderboard";
import { auth } from "@/auth";
import ThreeDotLoading from "@/app/ui/general/three-dot-loading";

const getBoulderScores = async (id: string) => {
  return await prisma.mixerBoulderScore.findMany({
    where: { competitionId: id },
    select: {
      climber: { select: { name: true, id: true, userId: true } },
      score: true,
      attempts: true,
    },
  });
};
const getRopeScores = async (id: string) => {
  return await prisma.mixerRopeScore.findMany({
    where: { competitionId: id },
    select: {
      climber: { select: { name: true, id: true, userId: true } },
      score: true,
      attempts: true,
    },
  });
};
const getDivisions = async (id: string) => {
  return await prisma.mixerDivision.findMany({
    where: { competitionId: id },
    select: {
      name: true,
      climbers: { select: { name: true, id: true, userId: true } },
    },
  });
};

const getCachedBoulderScores = unstable_cache(getBoulderScores, ["boulderScores-cache"], {
  revalidate: 200,
});
const getCachedRopeScores = unstable_cache(getRopeScores, ["ropeScores-cache"], {
  revalidate: 200,
});
const getCachedDivisions = unstable_cache(getDivisions, ["divisions-cache"], {
  revalidate: 200,
});

export default async function MixerDemoLeaderboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isScoresAvailable = await prisma.mixerCompetition.findFirst({
    where: { id: slug },
    select: { areScoresAvailable: true },
  });
  if (!isScoresAvailable?.areScoresAvailable) {
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
  const boulderScores = await getCachedBoulderScores(slug);
  const ropeScores = await getCachedRopeScores(slug);
  const divisions = await getCachedDivisions(slug);

  const { formattedDivisions, formattedBoulderScores, formattedRopeScores } =
    formatMixerDataFromDatabase(divisions, boulderScores, ropeScores);
  const { combinedScores, adjustedRankings, boulderScoresRanked, ropeScoresRanked } =
    calculateScores(formattedBoulderScores, formattedRopeScores, formattedDivisions);
  const session = await auth();
  const user = session?.user || null;
  return (
    <>
      <MixerLeaderBoard
        user={user}
        combinedScores={combinedScores}
        adjustedRankings={adjustedRankings}
        boulderScoresRanked={boulderScoresRanked}
        ropeScoresRanked={ropeScoresRanked}
      />
    </>
  );
}
