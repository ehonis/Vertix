export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VariablesComponent from "@/app/ui/admin/competitions/boulder-league/individualBLManagerPage/components/variables/variables-component";
import BoulderComponent from "@/app/ui/admin/competitions/boulder-league/individualBLManagerPage/components/boulders/boulders-component";
import UsersComponent from "@/app/ui/admin/competitions/boulder-league/individualBLManagerPage/components/users/users-component";
import DivisionsComponent from "@/app/ui/admin/competitions/boulder-league/individualBLManagerPage/components/divisions/divisions-component";
import TerminalComponent from "@/app/ui/admin/competitions/boulder-league/individualBLManagerPage/components/terminal/terminal-component";

export default async function page({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user || null;
  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }
  const { slug } = await params;
  const compId = slug;

  const [comp, compBoulders, compDivisions, compClimbers, compBoulderScores] = await Promise.all([
    prisma.bLCompetition.findFirst({
      where: { id: compId },
    }),
    prisma.bLBoulder.findMany({
      where: { competitionId: compId },
      orderBy: {
        points: "asc", // 'asc' for ascending
      },
    }),
    prisma.bLDivision.findMany({
      where: { competitionId: compId },
      orderBy: { level: "asc" },
    }),
    prisma.bLClimber.findMany({
      where: { competitionId: compId },
      orderBy: {
        name: "asc", // 'asc' for ascending
      },
    }),
    prisma.bLBoulderScore.findMany({
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
    <div className="w-full max-w-full py-5 flex flex-col items-center font-barlow font-bold text-white md:px-5">
      <div className="max-w-md md:max-w-full flex-col overflow-hidden">
        <Link
          href={"/admin/manager/competitions/boulder-league"}
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
          <p className="font-barlow font-bold text-xs text-white">Boulder League Manager</p>
        </Link>
        <div className="w-full flex flex-col md:flex-row md:gap-10 md:flex-wrap md:justify-center">
          <VariablesComponent
            passcode={comp.passcode}
            compId={compId}
            name={comp.name}
            weekOneStartDate={comp.weekOneStartDate}
            weekTwoStartDate={comp.weekTwoStartDate}
            weekThreeStartDate={comp.weekThreeStartDate}
            areScoresAvailable={comp.areScoresAvailable}
            status={comp.status}
            imageUrl={comp.imageUrl}
            hasScoresBeenCalculated={comp.hasScoresBeenCalculated}
            standingsType={comp.standingsType}
          />
          <UsersComponent
            compId={compId}
            climbers={compClimbers}
            boulderScores={compBoulderScores}
            divisions={compDivisions}
          />
          <DivisionsComponent divisions={compDivisions} compId={compId} />

          <BoulderComponent
            boulders={compBoulders}
            compId={compId}
            compStatus={comp.status}
            isBouldersReleased={comp.isBouldersReleased}
          />
          <TerminalComponent compId={compId} />
        </div>
      </div>
    </div>
  );
}
