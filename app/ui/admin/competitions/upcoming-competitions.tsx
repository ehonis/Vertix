import prisma from "@/prisma";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { CompetitionStatus } from "@prisma/client";
export default async function UpComingCompetitions() {
  const mixerUpComingCompetitions = await prisma.mixerCompetition.findMany({
    where: {
      status: {
        in: [CompetitionStatus.INACTIVE, CompetitionStatus.UPCOMING, CompetitionStatus.IN_PROGRESS],
      },
    },
    take: 3,
    select: { id: true, name: true, compDay: true, imageUrl: true, status: true },
  });
  const bLUpComingCompetitions = await prisma.bLCompetition.findMany({
    where: {
      status: {
        in: [CompetitionStatus.INACTIVE, CompetitionStatus.UPCOMING, CompetitionStatus.IN_PROGRESS],
      },
    },
  });
  const upComingCompetitions = [...mixerUpComingCompetitions, ...bLUpComingCompetitions];
  return (
    <div className="flex flex-col gap-2 rounded-sm">
      {upComingCompetitions.map(comp => (
        <Link
          key={comp.id}
          className={clsx(
            " max-w-md grid-cols-3 grid font-barlow font-bold text-white p-3 rounded-sm  items-center",
            comp.status === CompetitionStatus.INACTIVE && "bg-red-500/25 outline outline-red-500",
            comp.status === CompetitionStatus.UPCOMING && "bg-blue-500/25 outline outline-blue-500",
            comp.status === CompetitionStatus.IN_PROGRESS &&
              "bg-green-500/25 outline outline-green-500"
          )}
          href={`/admin/manager/competitions/${comp.name.includes("Mixer") ? "mixer" : "boulder-league"}/${comp.id}`}
        >
          {comp.imageUrl === null ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
              />
            </svg>
          ) : (
            <Image
              src={comp.imageUrl}
              height={100}
              width={100}
              className="rounded-full size-10"
              alt="pictue of competition"
            />
          )}
          <p className="text-sm text-center self-center">{comp.name}</p>
        </Link>
      ))}
    </div>
  );
}
