import prisma from "@/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import BoulderLeagueSignUpForm from "@/app/ui/competitions/boulder-league/signup/sign-up-form";
import { CompetitionStatus, User } from "@prisma/client";
import { redirect } from "next/navigation";
export default async function Signup({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const user = session?.user || null;

  const competition = await prisma.bLCompetition.findUnique({
    where: {
      id: slug,
    },
  });
  const climber = await prisma.bLClimber.findFirst({
    where: {
      competitionId: slug,
      userId: user?.id,
    },
  });
  const divisions = await prisma.bLDivision.findMany({
    where: {
      competitionId: slug,
    },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-white font-barlow font-bold text-2xl">
          You must be logged in to sign up for a competition
        </p>
        <Link href="/signin" className="text-blue-500 font-barlow font-bold text-2xl">
          Login
        </Link>
      </div>
    );
  }
  if (climber) {
    redirect(`/competitions/boulder-league/${slug}`);
    return (
      <div className="flex flex-col items-center justify-center h-screen-offset text-white font-barlow font-bold gap-5">
        <p className="text-2xl text-center">You are already signed up for this competition</p>

        <Link href={`/competitions/boulder-league/${slug}`} className="bg-blue-500 rounded p-2">
          Back to Comp Page
        </Link>
      </div>
    );
  }
  if (!competition) {
    return (
      <div className="flex flex-col items-center justify-center h-screen-offset text-white font-barlow font-bold gap-5">
        <p className="text-white font-barlow font-bold text-2xl">Competition not found</p>
        <Link href="/competitions" className="text-blue-500 font-barlow font-bold text-2xl">
          Back to competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-5 gap-2">
      <p className="text-white font-barlow font-bold text-2xl">Signup for {competition.name}</p>
      <div className="flex flex-col items-center justify-center">
        <BoulderLeagueSignUpForm divisions={divisions} user={user as User} compId={slug} />
      </div>
    </div>
  );
}
