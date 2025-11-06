"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import LevelIndicator from "../general/level-indicator";
import Image from "next/image";

export type MonthlyLeaderBoardData = {
  user: {
    name: string | null;
    id: string;
    totalXp: number;
    username: string | null;
    image: string | null;
  };
  xp: number;
}[];

export default function LeaderboardSlide({
  monthlyLeaderBoardData,
}: {
  monthlyLeaderBoardData: MonthlyLeaderBoardData;
}) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();

  const [showAll, setShowAll] = useState(false);
  const [buttonText, setButtonText] = useState("Monthly");
  const [headerText, setHeaderText] = useState(`${monthName} XP Leaderboard`);

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
    <div className="flex flex-col w-full  px-48 gap-5 font-barlow text-white ">
      <div className="flex flex-col items-start justify-start z-10 mr-20 ">
        <p className="text-white font-jost text-8xl">Vertix</p>
        <p className="text-white font-barlow text-md -mt-5 ml-12">
          All of your climbing data, in one place
        </p>
      </div>
      <h1 className="text-start text-4xl font-bold z-10">{headerText}</h1>
      <div className="flex flex-col gap-1.5 z-10">
        <div
          className="grid w-full font-tomorrow font-bold z-10"
          style={{ gridTemplateColumns: "60px 1fr 80px" }}
        >
          <h2 className="text-xl font-bold pl-1 ">Rank</h2>
          <h2 className="text-xl font-bold text-center no-wrap ">User</h2>
          <h2 className="text-xl font-bold text-end pr-1">XP</h2>
        </div>
        <div className="h-0.5 rounded-full bg-white z-10" />
        <div className="flex flex-col gap-3 z-10">
          {monthlyLeaderBoardData.length === 0 ? (
            <div className="text-center p-8 text-white font-barlow font-bold z-10">
              <div className="text-2xl mb-2">📊</div>
              <div>No monthly data available</div>
              <div className="text-sm mt-1">Start climbing to appear on the leaderboard!</div>
            </div>
          ) : (
            monthlyLeaderBoardData.slice(0, 7).map((climber, index) => (
              <div
                key={climber.user.id}
                className={clsx(
                  "z-10",
                  "grid w-full font-barlow font-bold py-3 pl-3 pr-1 rounded-md h-20",
                  index === 0 && "bg-amber-500/75 outline-1 outline-amber-500",
                  index === 1 && "bg-gray-500/75 outline-1 outline-gray-500",
                  index === 2 && "bg-orange-500/75 outline-1 outline-orange-500",
                  index > 2 && "bg-blue-500/25 outline-1 outline-blue-500"
                )}
                style={{ gridTemplateColumns: "60px 1fr 80px" }}
              >
                <span className="text-start place-self-center text-2xl font-bold">{index + 1}</span>
                <div className="flex items-center gap-1.5 justify-center">
                  <LevelIndicator xp={climber.user.totalXp} size="md" />
                  {climber.user.image && (
                    <Image
                      src={climber.user.image}
                      alt={climber.user.username || ""}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  )}
                  <span className="no-wrap truncate max-w-44 font-barlow font-bold text-2xl">
                    {climber.user.username ? climber.user.username : climber.user.id}
                  </span>
                </div>
                <span className=" flex items-center justify-center text-center text-green-400 px-5 text-xl rounded-full bg-slate-900/65 outline-1 outline-green-400">
                  {shortenXp(climber.xp)}xp
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: "radial-gradient(circle at bottom right, #fd9a00 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
