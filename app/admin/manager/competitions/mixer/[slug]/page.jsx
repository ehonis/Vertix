export const dynamic = 'force-dynamic';

import Link from 'next/link';
import prisma from '@/prisma';
import IndividualCompPageLoad from '@/app/ui/admin/competitions/mixer/individualMixerManagerPage/individual-comp-page-load';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function page({ params }) {
  const session = await auth();
  const user = session?.user || null;
  if (!user || !user?.admin) {
    redirect('/signin');
  }
  const { slug } = await params;
  const compId = slug;
  const [
    comp,
    compRoutes,
    compDivisions,
    compClimbers,
    compBoulderScores,
    compRopeScores,
  ] = await Promise.all([
    prisma.MixerCompetition.findFirst({
      where: { id: compId },
    }),
    prisma.MixerRoute.findMany({
      where: { competitionId: compId },
    }),
    prisma.MixerDivision.findMany({
      where: { competitionId: compId },
      select: { id: true, name: true },
      orderBy: { level: 'asc' },
    }),
    prisma.MixerClimber.findMany({
      where: { competitionId: compId },
      select: {
        id: true,
        name: true,
        entryMethod: true,
        userId: true,
        divisionId: true,
      },
    }),
    prisma.MixerBoulderScore.findMany({
      where: { competitionId: compId },
      select: { id: true, climberId: true, score: true, attempts: true },
    }),
    prisma.MixerRopeScore.findMany({
      where: { competitionId: compId },
    }),
  ]);

  if (!comp) {
    return (
      <div className="w-screen py-5 flex flex-col items-center font-barlow font-bold text-white">
        <p className="text-red-500">
          Competition not found or is still loading...
        </p>
        <Link href={'/admin/manager/competitions/mixer'}>Go Back</Link>
      </div>
    );
  }
  return (
    <div className="w-full max-w-full py-5 flex flex-col items-center font-barlow font-bold text-white">
      <div className="max-w-md flex-col overflow-hidden">
        <Link
          href={'/admin/manager/competitions/mixer'}
          className="flex gap-1 items-center "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <p className="font-barlow font-bold text-xs text-white">
            Mixer Manager
          </p>
        </Link>
        <div className="w-full overflow-hidden">
          <IndividualCompPageLoad
            compId={compId}
            name={comp.name}
            status={comp.status}
            compDay={comp.compDay}
            imageUrl={comp.imageUrl}
            areScoresAvailable={comp.areScoresAvailable}
            time={comp.time}
            routes={compRoutes}
            divisions={compDivisions}
            climbers={compClimbers}
            ropeScores={compRopeScores}
            boulderScores={compBoulderScores}
          />
        </div>
      </div>
    </div>
  );
}
