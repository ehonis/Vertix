import Link from 'next/link';
import prisma from '@/prisma';
import IndividualCompPageLoad from '@/app/ui/admin/competitions/mixer/individualMixerManagerPage/individual-comp-page-load';
export default async function page({ params }) {
  const { slug } = await params;
  const compId = slug;
  const comp = await prisma.MixerCompetition.findFirst({
    where: { id: compId },
  });
  const compRoutes = await prisma.MixerRoute.findMany({
    where: { competitionId: compId },
  });
  console.log(compRoutes);
  console.log(comp);
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
    <div className="w-screen  py-5 flex flex-col items-center font-barlow font-bold text-white">
      <div className="max-w-lg flex-col w-full px-5">
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
        <div className="">
          <IndividualCompPageLoad
            name={comp.name}
            status={comp.status}
            compDay={comp.compDay}
            imageUrl={comp.imageUrl}
            routes={compRoutes}
          />
        </div>
      </div>
    </div>
  );
}
