import Link from "next/link";
import { Suspense } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { CompetitionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MixerCompetitions from "@/app/ui/admin/competitions/mixer/mixer-competitions";

export default async function MixerManager() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }
  return (
    <div className="w-screen p-5 flex flex-col items-center">
      <div className="max-w-md flex-col flex">
        <Link href={"/admin/manager/competitions"} className="flex gap-1 items-center ">
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
          <p className="font-barlow font-bold text-xs text-white">Competitions Manager</p>
        </Link>
        <div className="mt-3 flex flex-col">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="font-barlow font-bold text-white text-4xl">Mixer Manager</h1>
            <div className="h-[2px] w-full bg-white"></div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <MixerCompetitions compStatus={CompetitionStatus.IN_PROGRESS} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <MixerCompetitions compStatus={CompetitionStatus.UPCOMING} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <MixerCompetitions compStatus={CompetitionStatus.COMPLETED} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <MixerCompetitions compStatus={CompetitionStatus.INACTIVE} />
            </Suspense>
          </div>

          <div>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <MixerCompetitions compStatus={CompetitionStatus.DEMO} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
