import { auth } from "@/auth";
import prisma from "@/prisma";
import Leaderboard from "../ui/leaderboard/leaderboard";

import { User } from "@/generated/prisma/client";

export default async function LeaderboardPage() {
  const session = await auth();
  const user = session?.user;

  // Add user check
  if (!user) {
    return (
      <div className="w-screen flex items-center justify-center h-96">
        <div className="text-white text-xl">Please sign in to view leaderboard</div>
      </div>
    );
  }

  const totalXpLeaderBoardData = await prisma.user.findMany({
    where: {
      totalXp: {
        gt: 0, // Only show users with XP
      },
      private: false,
    },
    orderBy: {
      totalXp: "desc",
    },
    take: 100, // Limit to top 100 for performance
  });

  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = today.toLocaleString("default", { month: "long" });

  const monthlyLeaderBoardData = await prisma.monthlyXp.findMany({
    where: {
      month: month,
      year: today.getFullYear(),
      user: {
        private: false,
      },
    },
    orderBy: {
      xp: "desc",
    },
    select: {
      user: {
        select: {
          name: true,
          id: true,
          totalXp: true,
          username: true,
          image: true,
        },
      },
      xp: true,
    },
  });

  let foundIndexOfUserMonthly;

  if (monthlyLeaderBoardData.length !== 0) {
    foundIndexOfUserMonthly = monthlyLeaderBoardData.findIndex(
      climber => climber.user.id === user?.id
    );
  }

  const foundIndexOfUserTotal = totalXpLeaderBoardData.findIndex(u => u.id === user.id);
  // Convert -1 to undefined if user not found
  const userTotalIndex = foundIndexOfUserTotal === -1 ? undefined : foundIndexOfUserTotal;
  return (
    <div className="w-screen flex  justify-center">
      <div className="px-4 pt-6 flex flex-col gap-4 items-center md:w-lg w-full">
        <div className="flex flex-col gap-1">
          <div className="relative bg-black rounded-md overflow-hidden flex justify-between items-end md:w-lg w-xs">
            <h1 className="relative font-barlow italic font-bold text-white text-4xl z-10">
              Leaderboard
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-12 fill-white relative z-10 -mb-1.5"
            >
              <path d="M112.41,102.53a8,8,0,0,1,5.06-10.12l12-4A8,8,0,0,1,140,96v40a8,8,0,0,1-16,0V107.1l-1.47.49A8,8,0,0,1,112.41,102.53ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16h8V104A16,16,0,0,1,40,88H80V56A16,16,0,0,1,96,40h64a16,16,0,0,1,16,16v72h40a16,16,0,0,1,16,16v56h8A8,8,0,0,1,248,208Zm-72-64v56h40V144ZM96,200h64V56H96Zm-56,0H80V104H40Z"></path>
            </svg>
          </div>
          <div className="md:w-lg w-xs h-1 rounded-full bg-white" />
        </div>

        <Leaderboard
          monthlyLeaderBoardData={monthlyLeaderBoardData}
          totalXpLeaderBoardData={totalXpLeaderBoardData}
          foundIndexOfUserTotal={userTotalIndex}
          foundIndexOfUserMonthly={foundIndexOfUserMonthly}
          user={user as User}
        />

        {/* <div
          className="absolute inset-0 opacity-60 -z-20"
          style={{
            background: "radial-gradient(circle at bottom right, #EFBF04 0%, transparent 65%)",
          }}
        /> */}
      </div>
    </div>
  );
}
