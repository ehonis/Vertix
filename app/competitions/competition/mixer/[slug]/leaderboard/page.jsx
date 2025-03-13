import prisma from '@/prisma';
import { formatMixerDataFromDatabase, calculateScores } from '@/lib/mixer';
import { unstable_cache } from 'next/cache';
import MixerLeaderBoard from '@/app/ui/competitions/mixer/mixer-leaderboard/mixer-leaderboard';
import { auth } from '@/auth';

const getBoulderScores = async () => {
  return await prisma.MixerBoulderScore.findMany({
    where: { competitionId: Mixer2024Id },
    select: {
      climber: { select: { name: true, id: true, userId: true } },
      score: true,
      attempts: true,
    },
  });
};
const getRopeScores = async () => {
  return await prisma.MixerRopeScore.findMany({
    where: { competitionId: Mixer2024Id },
    select: {
      climber: { select: { name: true, id: true, userId: true } },
      score: true,
      attempts: true,
    },
  });
};
const getDivisions = async () => {
  return await prisma.MixerDivision.findMany({
    where: { competitionId: Mixer2024Id },
    select: {
      name: true,
      climbers: { select: { name: true, id: true, userId: true } },
    },
  });
};

const getCachedBoulderScores = unstable_cache(
  getBoulderScores,
  ['boulderScores-cache'],
  { revalidate: 300 }
);
const getCachedRopeScores = unstable_cache(
  getRopeScores,
  ['ropeScores-cache'],
  { revalidate: 300 }
);
const getCachedDivisions = unstable_cache(getDivisions, ['divisions-cache'], {
  revalidate: 300,
});

export default async function MixerDemoLeaderboard({ params }) {
  const id = await params.slug;

  const isScoresAvailable = await prisma.MixerCompetition.findFirst({
    where: { id },
    select: { areScoresAvailable: true },
  });
  if (!isScoresAvailable.areScoresAvailable) {
    return (
      <div className="flex flex-col h-screen-offset justify-center items-center">
        <h1 className="text-white font-barlow font-bold text-3xl text-center">
          Scores Not Yet Available
        </h1>
        <p className="text-white font-barlow font-bold text-sm text-center">
          Please wait until Scores are being announced and refresh
        </p>
      </div>
    );
  }
  const boulderScores = await getCachedBoulderScores();
  const ropeScores = await getCachedRopeScores();
  const divisions = await getCachedDivisions();

  const { formattedDivisions, formattedBoulderScores, formattedRopeScores } =
    formatMixerDataFromDatabase(divisions, boulderScores, ropeScores);
  const {
    combinedScores,
    adjustedRankings,
    boulderScoresRanked,
    ropeScoresRanked,
  } = calculateScores(
    formattedBoulderScores,
    formattedRopeScores,
    formattedDivisions
  );
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
