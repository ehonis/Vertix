"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import LevelIndicator from "../general/level-indicator";

type MonthlyLeaderBoardData = {
  user: {
    name: string | null;
    id: string;
    totalXp: number;
    username: string | null;
  };
  xp: number;
}[];

export default function Leaderboard({
  monthlyLeaderBoardData,
  totalXpLeaderBoardData,
  foundIndexOfUserTotal,
  foundIndexOfUserMonthly,
  user,
}: {
  monthlyLeaderBoardData: MonthlyLeaderBoardData;
  totalXpLeaderBoardData: User[];
  foundIndexOfUserTotal: number | undefined;
  foundIndexOfUserMonthly: number | undefined;
  user: User | null;
}) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = today.toLocaleString("default", { month: "short" });
  const year = today.getFullYear();

  const [showAll, setShowAll] = useState(false);
  const [buttonText, setButtonText] = useState("Monthly");
  const [headerText, setHeaderText] = useState(`${monthName}. XP Leaderboard`);

  const handleDateButtonClick = () => {
    setButtonText(buttonText === "Monthly" ? "Total" : "Monthly");
    if (buttonText === "Monthly") {
      setHeaderText(`Total XP Leaderboard`);
    } else {
      setHeaderText(`${monthName}. XP Leaderboard`);
    }
  };
  let monthlyXp = null;
  if (user) {
    monthlyXp = monthlyLeaderBoardData.find(climber => climber.user.id === user.id)?.xp;
  }

  const shortenXp = (xp: number) => {
    if (xp > 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp > 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    } else {
      return xp;
    }
  };

  return (
    <div className="flex flex-col w-full px-2 gap-5 font-barlow text-white">
      {/* userData */}
      {user ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            Your Position{" "}
            <span className="text-sm">{buttonText === "Monthly" ? "(monthly)" : "(total)"}</span>
          </h2>
          <div
            className={clsx(
              "flex py-3 pl-3 pr-1 rounded-md bg-blue-500/35 outline-1 outline-blue-500 justify-between font-barlow font-bold",
              buttonText === "Monthly"
                ? "bg-blue-500/35 outline-1 outline-blue-500"
                : "bg-purple-500/35 outline-1 outline-purple-500"
            )}
          >
            {buttonText === "Monthly" ? (
              foundIndexOfUserMonthly !== undefined ? (
                <>
                  <span>{foundIndexOfUserMonthly + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <LevelIndicator xp={user.totalXp} size="sm" />
                    <span>{user.username ? user.username : user.id}</span>
                  </div>
                  <span className="text-center text-sm text-green-400 px-2 rounded-full bg-slate-900/65 outline-1 outline-green-400">
                    {shortenXp(monthlyXp ? monthlyXp : 0)}xp
                  </span>
                </>
              ) : (
                <div>No Data for this month</div>
              )
            ) : foundIndexOfUserTotal !== undefined ? (
              <>
                <span>{foundIndexOfUserTotal + 1}</span>
                <div className="flex items-center gap-1.5">
                  <LevelIndicator xp={user.totalXp} size="sm" />
                  <span>{user.username ? user.username : user.id}</span>
                </div>
                <span className="text-center  text-green-400 px-2 rounded-full bg-slate-900/65 outline-1 outline-green-400">
                  {shortenXp(user.totalXp)}xp
                </span>
              </>
            ) : (
              <div>No Data for this month</div>
            )}
          </div>
          {!user.private ? (
            <div className="text-xs ">
              <p>
                Your profile is <span className="text-green-400 font-bold">public</span>, so you are{" "}
                <span className="underline font-bold">visible</span> on the leaderboard. To change
                this, go to your{" "}
                <Link
                  href={`/profile/${user.username}/settings`}
                  className="text-blue-400 underline"
                >
                  profile settings
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="text-xs ">
              <p>
                Your profile is <span className="text-red-400 font-bold">private</span>, so you are{" "}
                <span className="underline font-bold">invisible</span> on the leaderboard. To change
                this, go to your{" "}
                <Link
                  href={`/profile/${user.username}/settings`}
                  className="text-blue-400 underline"
                >
                  profile settings
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={"/signin"}
          className="text-center text-lg font-bold p-3 rounded-md bg-linear-to-l from-purple-500/35 to-purple-700/35 outline-purple-600 outline"
        >
          <p>Sign up or sign in to see your position!</p>
        </Link>
      )}

      <div className="flex gap-4 justify-between items-center">
        <h1 className="text-start text-3xl font-bold">{headerText}</h1>
        <button
          className={clsx(
            "p-2 rounded-full  text-md font-semibold",
            buttonText === "Monthly"
              ? "bg-blue-500/35 outline-1 outline-blue-500"
              : "bg-purple-500/35 outline-1 outline-purple-500"
          )}
          onClick={handleDateButtonClick}
        >
          {buttonText}
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          className="grid w-full font-tomorrow font-bold"
          style={{ gridTemplateColumns: "60px 1fr 80px" }}
        >
          <h2 className="text-xl font-bold pl-1 ">Rank</h2>
          <h2 className="text-xl font-bold text-center no-wrap ">User</h2>
          <h2 className="text-xl font-bold text-end pr-1">XP</h2>
        </div>
        <div className="h-0.5 rounded-full bg-white" />
        <div className="flex flex-col gap-3">
          {buttonText === "Monthly" ? (
            monthlyLeaderBoardData.length === 0 ? (
              <div className="text-center p-8 text-white font-barlow font-bold">
                <div className="text-2xl mb-2">📊</div>
                <div>No monthly data available</div>
                <div className="text-sm mt-1">Start climbing to appear on the leaderboard!</div>
              </div>
            ) : (
              monthlyLeaderBoardData
                .slice(0, showAll ? monthlyLeaderBoardData.length : 10)
                .map((climber, index) => (
                  <div
                    key={climber.user.id}
                    className={clsx(
                      "grid w-full font-barlow font-bold py-3 pl-3 pr-1 rounded-md ",
                      index === 0 && "bg-amber-500/75 outline-1 outline-amber-500",
                      index === 1 && "bg-gray-500/75 outline-1 outline-gray-500",
                      index === 2 && "bg-orange-500/75 outline-1 outline-orange-500",
                      index > 2 && "bg-blue-500/25 outline-1 outline-blue-500"
                    )}
                    style={{ gridTemplateColumns: "60px 1fr 80px" }}
                  >
                    <span className="text-start">{index + 1}</span>
                    <div className="flex items-center gap-1.5 justify-center">
                      <LevelIndicator xp={climber.user.totalXp} size="sm" />
                      <span className="no-wrap truncate max-w-44 font-barlow font-bold">
                        {climber.user.username ? climber.user.username : climber.user.id}
                      </span>
                    </div>
                    <span className="text-center text-green-400 px-2 rounded-full bg-slate-900/65 outline-1 outline-green-400">
                      {shortenXp(climber.xp)}xp
                    </span>
                  </div>
                ))
            )
          ) : (
            totalXpLeaderBoardData
              .slice(0, showAll ? totalXpLeaderBoardData.length : 10)
              .map((climber, index) => (
                <div
                  key={climber.id}
                  className={clsx(
                    "grid w-full font-barlow font-bold py-3 pl-3 pr-1 rounded-md ",
                    index === 0 && "bg-amber-500/75 outline-1 outline-amber-500",
                    index === 1 && "bg-gray-500/75 outline-1 outline-gray-500",
                    index === 2 && "bg-orange-500/75 outline-1 outline-orange-500",
                    index > 2 && "bg-purple-500/25 outline-1 outline-purple-500"
                  )}
                  style={{ gridTemplateColumns: "60px 1fr 80px" }}
                >
                  <span className="text-start">{index + 1}</span>
                  <div className="flex items-center gap-1.5 justify-center">
                    <LevelIndicator xp={climber.totalXp} size="sm" />
                    <span className="no-wrap truncate max-w-44 ">
                      {climber.username ? climber.username : climber.id}
                    </span>
                  </div>
                  <span className="text-center  text-green-400 px-2 rounded-full bg-slate-900/65 outline-1 outline-green-400">
                    {shortenXp(climber.totalXp)}xp
                  </span>
                </div>
              ))
          )}
        </div>

        {/* Show More/Less Button */}
        {buttonText === "Monthly"
          ? monthlyLeaderBoardData.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 p-2 rounded-md bg-blue-500/25 outline-1 outline-blue-500 text-white font-barlow font-semibold hover:bg-blue-500/35 transition-colors"
              >
                {showAll ? "Show Less" : `Show All (${monthlyLeaderBoardData.length})`}
              </button>
            )
          : totalXpLeaderBoardData.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 p-2 rounded-md bg-purple-500/25 outline-1 outline-purple-500 text-white font-barlow font-semibold hover:bg-purple-500/35 transition-colors"
              >
                {showAll ? "Show Less" : `Show All (${totalXpLeaderBoardData.length})`}
              </button>
            )}
      </div>
    </div>
  );
}
