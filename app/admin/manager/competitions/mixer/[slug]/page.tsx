export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VariablesComponent from "@/app/ui/admin/competitions/mixer/individualMixerManagerPage/components/variables/variables-component";
import RoutesComponent from "@/app/ui/admin/competitions/mixer/individualMixerManagerPage/components/routes/routes-component";
import BoulderComponent from "@/app/ui/admin/competitions/mixer/individualMixerManagerPage/components/boulders/boulders-component";
import UsersComponent from "@/app/ui/admin/competitions/mixer/individualMixerManagerPage/components/users/users-component";
import DivisionsComponent from "@/app/ui/admin/competitions/mixer/individualMixerManagerPage/components/divisions/divisions-component";

export default async function page({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user || null;
  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }
  const { slug } = await params;
  const compId = slug;

  const [
    comp,
    compRoutes,
    compBoulders,
    compDivisions,
    compClimbers,
    compBoulderScores,
    compRopeScores,
  ] = await Promise.all([
    prisma.mixerCompetition.findFirst({
      where: { id: compId },
    }),
    prisma.mixerRoute.findMany({
      where: { competitionId: compId },
      orderBy: {
        name: "asc", // 'asc' for ascending
      },
    }),
    prisma.mixerBoulder.findMany({
      where: { competitionId: compId },
      orderBy: {
        points: "asc", // 'asc' for ascending
      },
    }),
    prisma.mixerDivision.findMany({
      where: { competitionId: compId },
      orderBy: { level: "asc" },
    }),
    prisma.mixerClimber.findMany({
      where: { competitionId: compId },
      orderBy: {
        name: "asc", // 'asc' for ascending
      },
    }),
    prisma.mixerBoulderScore.findMany({
      where: { competitionId: compId },
    }),
    prisma.mixerRopeScore.findMany({
      where: { competitionId: compId },
    }),
  ]);

  if (!comp) {
    return (
      <div className="w-screen py-5 flex flex-col items-center font-barlow font-bold text-white">
        <p className="text-red-500">Competition not found or is still loading...</p>
        <Link href={"/admin/manager/competitions/mixer"}>Go Back</Link>
      </div>
    );
  }
  return (
    <div className="w-full max-w-full py-5 flex flex-col items-center font-barlow font-bold text-white">
      <div className="max-w-md md:max-w-full flex-col overflow-hidden">
        <Link href={"/admin/manager/competitions/mixer"} className="flex gap-1 items-center ">
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
          <p className="font-barlow font-bold text-xs text-white">Mixer Manager</p>
        </Link>
        <div className="w-full flex flex-col md:flex-row md:gap-10 md:flex-wrap ">
          <VariablesComponent
            passcode={comp.passcode}
            compId={compId}
            name={comp.name}
            compDay={comp.compDay}
            areScoresAvailable={comp.areScoresAvailable}
            status={comp.status}
            time={comp.time}
            imageUrl={comp.imageUrl}
            hasScoresBeenCalculated={comp.hasScoresBeenCalculated}
            standingsType={comp.standingsType}
          />
          <UsersComponent
            compId={compId}
            climbers={compClimbers}
            ropeScores={compRopeScores}
            boulderScores={compBoulderScores}
            divisions={compDivisions}
          />
          <DivisionsComponent divisions={compDivisions} compId={compId} />
          <RoutesComponent routes={compRoutes} compId={compId} />
          <BoulderComponent boulders={compBoulders} compId={compId} />
        </div>
      </div>
    </div>
  );
}
