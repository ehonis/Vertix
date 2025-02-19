import Link from 'next/link';
import prisma from '@/prisma';
import IndividualCompPageLoad from '@/app/ui/admin/competitions/mixer/individual-comp-page-load';
export default async function page({ params }) {
  const compId = params.slug;
  const comp = await prisma.MixerCompetition.findUnique({
    where: { id: compId },
  });
  console.log(comp);
  return (
    <div className="w-screen px-3 py-5 flex flex-col items-center font-barlow text-white">
      <div className="max-w-md flex-col flex">
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
          <p className="font-barlow text-xs text-white">Mixer Manager</p>
        </Link>
        <div>
          <IndividualCompPageLoad name={comp.name} />
        </div>
      </div>
    </div>
  );
}
