import Link from "next/link";

import Image from "next/image";
import prisma from "@/prisma";
import { Suspense } from "react";
import clsx from "clsx";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";
import { CompetitionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
async function TestComps() {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== UserRole.ADMIN) {
    return null;
  } else {
    const testCompetitions = await prisma.mixerCompetition.findMany({
      where: {
        isTestCompetition: true,
      },
    });
    if (testCompetitions.length === 0) {
      return null;
    } else {
      return (
        <div className="flex flex-col justify-center ">
          <h1 className="font-barlow text-2xl text-white font-semibold mb-1">Tests</h1>
          <div className="flex flex-col gap-3 w-full">
            {testCompetitions.map(comp => (
              <Link
                key={comp.id}
                href={`/competitions/mixer/${comp.id}`}
                className={clsx(
                  " bg-red-500/15 rounded-lg  p-2 flex justify-between outline outline-red-400 place-items-center",
                  comp.status === CompetitionStatus.INACTIVE && "outline-red-400 bg-red-500/15",
                  comp.status === CompetitionStatus.UPCOMING && "outline-blue-400 bg-blue-500/15",
                  comp.status === CompetitionStatus.IN_PROGRESS &&
                    "outline-green-400 bg-green-500/15",
                  comp.status === CompetitionStatus.COMPLETED && "outline-green-400 bg-green-500/15"
                )}
              >
                <div className="flex flex-col">
                  <p className="font-barlow  text-white text-xl  whitespace-nowrap text-start">
                    {comp.name}
                  </p>

                  <p className="text-red-400 text-sm italic ">
                    {comp.status === CompetitionStatus.INACTIVE && "Inactive"}
                    {comp.status === CompetitionStatus.UPCOMING && "Upcoming"}
                    {comp.status === CompetitionStatus.IN_PROGRESS && "In Progress"}
                    {comp.status === CompetitionStatus.COMPLETED && "Completed"}
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                  viewBox="0 0 256 256"
                  className="size-12 stroke-white fill-white relative z-10 self-center place-self-start"
                >
                  <path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"></path>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      );
    }
  }
}
async function DemoComps() {
  const demoCompetitions = await prisma.mixerCompetition.findMany({
    where: {
      status: CompetitionStatus.DEMO,
      isTestCompetition: false,
    },
  });
  return (
    <div className="flex flex-col justify-center ">
      <h1 className="font-barlow text-2xl text-white font-semibold mb-1">Demo</h1>
      <div className="flex flex-col gap-3 w-full">
        {demoCompetitions.map(comp => (
          <Link
            key={comp.id}
            href={`/competitions/demo/${comp.id}`}
            className=" bg-yellow-500/15 rounded-lg  p-2 flex justify-between outline outline-yellow-400 place-items-center"
          >
            <div className="flex flex-col">
              <p className="font-barlow  text-white text-xl text-center whitespace-nowrap">
                {comp.name}
              </p>

              <p className="text-yellow-400 text-sm italic ">Demo</p>
            </div>
            {comp.status === CompetitionStatus.DEMO && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
                viewBox="0 0 256 256"
                className="size-12 stroke-white fill-white relative z-10 self-center place-self-start"
              >
                <path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"></path>
              </svg>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
async function UpComingComps() {
  const mixerCompetitions = await prisma.mixerCompetition.findMany({
    where: {
      status: {
        in: [CompetitionStatus.UPCOMING, CompetitionStatus.IN_PROGRESS],
      },
      isTestCompetition: false,
    },
  });

  return (
    <div className="flex flex-col justify-center ">
      <h1 className="font-barlow text-2xl text-white font-semibold mb-1">Active or Upcoming</h1>
      <div className="flex flex-col gap-3 w-full">
        {mixerCompetitions.map(comp => (
          <Link
            key={comp.id}
            href={`/competitions/mixer/${comp.id}`}
            className={clsx(
              " bg-blue-500/15 rounded-lg  p-2 flex justify-between outline  place-items-center",
              comp.status === CompetitionStatus.UPCOMING && "outline-blue-500 bg-blue-500/15",
              comp.status === CompetitionStatus.IN_PROGRESS && "outline-green-500 bg-green-500/15"
            )}
          >
            <div className="flex flex-col">
              <p className="font-barlow  text-white text-xl text-start whitespace-nowrap">
                {comp.name}
              </p>
              {comp.status === CompetitionStatus.UPCOMING && (
                <p className="text-blue-500 text-sm italic ">Sign Ups are Active!</p>
              )}
              {comp.status === CompetitionStatus.INACTIVE && (
                <p className="text-red-500 text-sm italic ">Currently Unavailable</p>
              )}
              {comp.status === CompetitionStatus.IN_PROGRESS && (
                <p className="text-green-500 text-sm italic ">In Progress</p>
              )}
            </div>
            {!comp.imageUrl ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-12 stroke-white relative z-10 self-center place-self-start"
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
                width={100}
                height={100}
                className="size-12 rounded-full object-cover  self-center place-self-start"
                alt="comp icon"
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function page() {
  return (
    <div className="w-screen">
      <div className="px-4 pt-4 flex flex-col gap-4 items-center w-full">
        <div className="flex flex-col gap-1">
          <div className="relative bg-black rounded-md overflow-hidden flex justify-between items-end md:w-lg w-xs">
            <h1 className="relative font-barlow italic font-bold text-white text-4xl z-10">
              Competitions
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-12 fill-white relative z-10"
            >
              <path
                fillRule="evenodd"
                d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="md:w-lg w-xs h-1 rounded-full bg-white" />
        </div>
        <div className="w-xs md:w-lg">
          <Suspense
            fallback={
              <div className="flex justify-center mt-2">
                <ElementLoadingAnimation />
              </div>
            }
          >
            <UpComingComps />
          </Suspense>
        </div>
        <div className="w-xs md:w-lg">
          <Suspense
            fallback={
              <div className="flex justify-center mt-2">
                <ElementLoadingAnimation />
              </div>
            }
          >
            <DemoComps />
          </Suspense>
        </div>

        <div className="w-xs md:w-lg">
          <Suspense
            fallback={
              <div className="flex justify-center mt-2">
                <ElementLoadingAnimation />
              </div>
            }
          >
            <TestComps />
          </Suspense>
        </div>

        <div
          className="absolute inset-0 opacity-40 -z-20"
          style={{
            background: "radial-gradient(circle at bottom right, #ef4444 0%, transparent 65%)",
          }}
        />
      </div>
    </div>
  );
}
