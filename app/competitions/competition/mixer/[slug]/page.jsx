import Link from "next/link";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { CompetitionStatus } from "@prisma/client";
export default async function page({ params }) {
  const compId = (await params).slug;
  const competition = await prisma.MixerCompetition.findUnique({
    where: { id: compId },
  });

  const session = await auth();
  const user = session?.user || null;

  let climberExists = null;

  if (user) {
    climberExists = await prisma.MixerClimber.findFirst({
      where: {
        competitionId: compId,
        userId: user.id,
      },
    });
  }

  return (
    <div className="flex flex-col justify-center items-center pt-5 gap-2 w-screen">
      <div className="flex flex-col justify-center items-center gap-2 w-screen">
        <Link
          href="/competitions"
          className="text-white font-barlow font-bold text-sm md:text-base hover:underline"
        >
          ← Back to Competitions
        </Link>
      </div>
      <h1 className="text-white font-barlow font-bold text-3xl">{competition.name}</h1>
      <div className="flex flex-col justify-center items-center gap-8 bg-black p-10 rounded-md md:w-md w-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-16 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
          />
        </svg>

        <div className="flex flex-col gap-5">
          {competition.status === CompetitionStatus.UPCOMING && climberExists !== null && (
            <div className="flex flex-col gap-1">
              <p className="text-white font-barlow font-bold text-xs bg-green-500/25 border-green-500 border rounded-md p-2">
                You are already signed up for this competition!
              </p>
              <p className="text-white font-barlow font-bold text-xs bg-green-500/25 border-green-500 border rounded-md p-2">
                Come back to this page on {competition.compDay.toLocaleDateString("en-US")} to start
                the competition!
              </p>
            </div>
          )}
          {competition.status === CompetitionStatus.UPCOMING && climberExists === null && (
            <div className="flex flex-col gap-1">
              <p className="text-white font-barlow font-bold text-xs bg-green-500/25 border-green-500 border rounded-md p-2">
                Sign up for {competition.name} now!
              </p>
              {!user ? (
                <div className="flex flex-col gap-1 mt-5">
                  <p className="text-white font-barlow font-bold text-xs text-center">
                    Create an account with Vertix First
                  </p>
                  <Link
                    href={`/signin`}
                    className="px-2 py-1 text-white bg-green-500 rounded-sm font-barlow font-bold text-center shadow-xl"
                  >
                    Create an Account with Vertix
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/competitions/competition/mixer/${compId}/signup`}
                  className="px-2 py-1 text-white bg-green-500 rounded-sm font-barlow font-bold text-center shadow-xl"
                >
                  Sign up
                </Link>
              )}
            </div>
          )}
          {competition.status === CompetitionStatus.INACTIVE && (
            <div className="flex flex-col gap-1">
              <p className="text-white font-barlow font-bold text-xs bg-red-500/25 border-red-500 border rounded-md p-2">
                This competition is not available yet.
              </p>

              <p className="text-white font-barlow font-bold text-xs bg-yellow-400/25 border-yellow-400 border rounded-md p-2">
                Look out for updates on social media and the comps page to see when sign ups are
                available
              </p>
            </div>
          )}
          {competition.status === CompetitionStatus.DEMO && (
            <div className="flex flex-col gap-1">
              <p className="text-white font-barlow font-bold text-xs bg-orange-500/25 border-orange-500 border rounded-md p-2">
                this uses previous year{"'"}s data.
              </p>{" "}
              <p className="text-white font-barlow font-bold text-xs bg-blue-500/25 border-blue-500 border rounded-md p-2">
                This is just a demo for you to see how comp day will work. No points, attempts, or
                completions will be counted
              </p>
            </div>
          )}
          {competition.status === CompetitionStatus.DEMO && (
            <div className="flex flex-col gap-2">
              <Link
                href={`/competitions/competition/mixer/${compId}/scroller`}
                className="px-2 py-1 text-white bg-green-500 rounded-sm font-barlow font-bold text-center shadow-xl"
              >
                Start Demo
              </Link>
              <Link
                href={`/competitions/competition/mixer/${compId}/leaderboard`}
                className="px-2 py-1 text-white bg-yellow-500 rounded-sm font-barlow font-bold text-center shadow-xl"
              >
                Leaderboard Demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
