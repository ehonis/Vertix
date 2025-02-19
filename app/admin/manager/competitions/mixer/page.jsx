import Link from 'next/link';
import { Suspense } from 'react';
import ElementLoadingAnimation from '@/app/ui/general/element-loading-animation';
import UpcomingMixerCompetitions from '@/app/ui/admin/competitions/mixer/upcoming-mixer-competitions';
import CompletedMixerCompetitions from '@/app/ui/admin/competitions/mixer/completed-mixer-competitions';
export default async function MixerManager() {
  return (
    <div className="w-screen p-5 flex flex-col items-center">
      <div className="max-w-md flex-col flex">
        <Link
          href={'/admin/manager/competitions'}
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
          <p className="font-barlow text-xs text-white">Competitions Manager</p>
        </Link>
        <div className="mt-3 flex flex-col">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="font-barlow text-white text-4xl">Mixer Manager</h1>
            <div className="h-[2px] w-full bg-white"></div>
          </div>
        </div>
        <div className="mb-3">
          <h2 className="font-barlow text-2xl text-white mb-2">
            <span className="text-orange-400">Upcoming</span> Mixer Competitions
          </h2>
          <div className="bg-bg2 w-full p-3 rounded flex justify-center">
            <Suspense fallback={<ElementLoadingAnimation />}>
              <UpcomingMixerCompetitions />
            </Suspense>
          </div>
        </div>
        <div>
          <h2 className="font-barlow text-2xl text-white mb-2">
            <span className="text-green-500">Completed</span> Mixer Competitions
          </h2>
          <div className="bg-bg2 w-full p-3 rounded flex justify-center">
            <Suspense fallback={<ElementLoadingAnimation />}>
              <CompletedMixerCompetitions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
