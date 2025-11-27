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

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  return (
    <div className="flex flex-col w-full px-2 gap-5 font-barlow text-white">
      {/* userData */}

      {user ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">
            Your Position{" "}
            <span className="text-sm">{buttonText === "Monthly" ? "(monthly)" : "(total)"}</span>
          </h2>

          {buttonText === "Monthly" ? (
            foundIndexOfUserMonthly !== undefined ? (
              (() => {
                const userRank = foundIndexOfUserMonthly;
                const userMedalIcon = getMedalIcon(userRank);
                console.log(userRank);
                const topXp = monthlyLeaderBoardData[0]?.xp || 1;
                const userXp = monthlyXp || 0;
                const xpPercentage = (userXp / topXp) * 100;

                return (
                  <div
                    className={clsx(
                      "grid w-full font-barlow font-bold pl-3 pr-2  py-3 rounded-lg shadow-md transition-all duration-300",
                      "grid-cols-[4rem_1fr_6rem] md:grid-cols-[5rem_1fr_7rem]",

                      userRank === 0 &&
                        "bg-amber-500/75 outline-2 outline-amber-500 shadow-amber-500/50 ring-1 ring-offset-1 ring-offset-black ring-amber-400",
                      userRank === 1 &&
                        "bg-gray-500/75 outline-2 outline-gray-500 shadow-gray-500/50 ring-1 ring-offset-1 ring-offset-black ring-gray-400",
                      userRank === 2 &&
                        "bg-orange-500/75 outline-2 outline-orange-500 shadow-orange-500/50 ring-1 ring-offset-1 ring-offset-black ring-orange-400",
                      userRank > 2 ||
                        (userRank === -1 &&
                          "bg-blue-500/25 outline-1 outline-blue-500 shadow-blue-500/30")
                    )}
                  >
                    <div className="flex items-center justify-start gap-2">
                      {userMedalIcon && <span className="text-2xl">{userMedalIcon}</span>}
                      <span
                        className={clsx(
                          "font-bold drop-shadow-lg",
                          userRank === 0 && "text-amber-300",
                          userRank === 1 && "text-gray-300",
                          userRank === 2 && "text-orange-300",
                          userRank > 2 && "text-blue-300"
                        )}
                      >
                        #{userRank + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-full">
                      <div className="flex items-center justify-center gap-2">
                        <LevelIndicator xp={user.totalXp} size="xs" />
                        {user.image ? (
                          <div
                            className={clsx(
                              "rounded-full overflow-hidden border-2 w-7 h-7 border-white/30"
                            )}
                          >
                            <Image
                              src={user.image}
                              alt={user.username || ""}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={clsx(
                          "no-wrap truncate font-barlow font-bold drop-shadow-lg max-w-xs text-xs"
                        )}
                      >
                        {user.username ? user.username : user.id}
                      </span>
                      <div />
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1">
                      <span className="flex items-center justify-center text-center text-green-400 rounded-full bg-slate-900/60 px-3 py-1 border border-green-400/50 drop-shadow-lg font-bold text-sm">
                        {shortenXp(userXp)} XP
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center p-8 text-white font-barlow font-bold rounded-lg bg-blue-500/25 outline-1 outline-blue-500">
                <div className="text-2xl mb-2">📊</div>
                <div>No Data for this month</div>
              </div>
            )
          ) : foundIndexOfUserTotal !== undefined ? (
            (() => {
              const userRank = foundIndexOfUserTotal;
              const userMedalIcon = getMedalIcon(userRank);

              const topXp = totalXpLeaderBoardData[0]?.totalXp || 1;
              const userXp = user.totalXp;
              const xpPercentage = (userXp / topXp) * 100;

              return (
                <div
                  className={clsx(
                    "grid w-full font-barlow font-bold pl-3 pr-2 rounded-lg shadow-md transition-all duration-300",
                    "grid-cols-[4rem_1fr_6rem] md:grid-cols-[5rem_1fr_7rem] py-3",
                    userRank === 0 &&
                      "bg-amber-500/75 outline-2 outline-amber-500 shadow-amber-500/50 ring-1 ring-offset-1 ring-offset-black ring-amber-400",
                    userRank === 1 &&
                      "bg-gray-500/75 outline-2 outline-gray-500 shadow-gray-500/50 ring-1 ring-offset-1 ring-offset-black ring-gray-400",
                    userRank === 2 &&
                      "bg-orange-500/75 outline-2 outline-orange-500 shadow-orange-500/50 ring-1 ring-offset-1 ring-offset-black ring-orange-400",
                    userRank > 2 &&
                      "bg-purple-500/25 outline-1 outline-purple-500 shadow-purple-500/30"
                  )}
                >
                  <div className="flex items-center justify-start gap-2">
                    {userMedalIcon && <span className="text-2xl">{userMedalIcon}</span>}
                    <span
                      className={clsx(
                        "font-bold drop-shadow-lg",
                        userRank === 0 && "text-amber-300",
                        userRank === 1 && "text-gray-300",
                        userRank === 2 && "text-orange-300",
                        userRank > 2 && "text-purple-300"
                      )}
                    >
                      #{userRank + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-full">
                    <div className="flex items-center justify-center gap-2">
                      <LevelIndicator xp={user.totalXp} size="xs" />
                      {user.image ? (
                        <div
                          className={clsx(
                            "rounded-full overflow-hidden border-2 w-7 h-7 border-white/30"
                          )}
                        >
                          <Image
                            src={user.image}
                            alt={user.username || ""}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={clsx(
                        "no-wrap truncate font-barlow font-bold drop-shadow-lg max-w-xs text-xs"
                      )}
                    >
                      {user.username ? user.username : user.id}
                    </span>
                    <div />
                  </div>
                  <div className="flex flex-col items-end justify-center gap-1">
                    <span className="flex items-center justify-center text-center text-green-400 rounded-full bg-slate-900/60 px-3 py-1 border border-green-400/50 drop-shadow-lg font-bold text-sm">
                      {shortenXp(userXp)} XP
                    </span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center p-8 text-white font-barlow font-bold rounded-lg bg-purple-500/25 outline-1 outline-purple-500">
              <div className="text-2xl mb-2">📊</div>
              <div>No Data for this month</div>
            </div>
          )}
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
            "p-2 px-4 rounded-full  text-md font-semibold",
            buttonText === "Monthly"
              ? "bg-blue-500/35 outline-1 outline-blue-500"
              : "bg-purple-500/35 outline-1 outline-purple-500"
          )}
          onClick={handleDateButtonClick}
        >
          {buttonText}
        </button>
      </div>
      <div className="flex flex-col gap-2">
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
                .map((climber, index) => {
                  const medalIcon = getMedalIcon(index);

                  const topXp = monthlyLeaderBoardData[0]?.xp || 1;

                  return (
                    <div
                      key={climber.user.id}
                      className={clsx(
                        "grid w-full font-barlow font-bold pl-3 pr-2 rounded-lg shadow-md transition-all duration-300",
                        "grid-cols-[4rem_1fr_6rem] md:grid-cols-[5rem_1fr_7rem] py-3",
                        index === 0 &&
                          "bg-amber-500/75 outline-2 outline-amber-500 shadow-amber-500/50 ring-1 ring-offset-1 ring-offset-black ring-amber-400",
                        index === 1 &&
                          "bg-gray-500/75 outline-2 outline-gray-500 shadow-gray-500/50 ring-1 ring-offset-1 ring-offset-black ring-gray-400",
                        index === 2 &&
                          "bg-orange-500/75 outline-2 outline-orange-500 shadow-orange-500/50 ring-1 ring-offset-1 ring-offset-black ring-orange-400",
                        index > 2 && "bg-blue-500/25 outline-1 outline-blue-500 shadow-blue-500/30"
                      )}
                    >
                      <div className="flex items-center justify-start gap-2">
                        {medalIcon && <span className="text-2xl">{medalIcon}</span>}
                        <span
                          className={clsx(
                            "font-bold drop-shadow-lg",
                            index === 0 && "text-amber-300",
                            index === 1 && "text-gray-300",
                            index === 2 && "text-orange-300",
                            index > 2 && "text-blue-300"
                          )}
                        >
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-full">
                        <div className="flex items-center justify-center gap-2">
                          <LevelIndicator xp={climber.user.totalXp} size="xs" />
                          {climber.user.image ? (
                            <div
                              className={clsx(
                                "rounded-full overflow-hidden border-2 w-7 h-7 border-white/30"
                              )}
                            >
                              <Image
                                src={climber.user.image}
                                alt={climber.user.username || ""}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-7"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={clsx(
                            "no-wrap truncate font-barlow font-bold drop-shadow-lg max-w-[70%] text-xs"
                          )}
                        >
                          {climber.user.username ? climber.user.username : climber.user.id}
                        </span>
                        <div />
                      </div>
                      <div className="flex flex-col items-end justify-center gap-1">
                        <span className="flex items-center justify-center text-center text-green-400 rounded-full bg-slate-900/60 px-3 py-1 border border-green-400/50 drop-shadow-lg font-bold text-sm">
                          {shortenXp(climber.xp)} XP
                        </span>
                      </div>
                    </div>
                  );
                })
            )
          ) : (
            totalXpLeaderBoardData
              .slice(0, showAll ? totalXpLeaderBoardData.length : 10)
              .map((climber, index) => {
                const medalIcon = getMedalIcon(index);

                const topXp = totalXpLeaderBoardData[0]?.totalXp || 1;

                return (
                  <div
                    key={climber.id}
                    className={clsx(
                      "grid w-full font-barlow font-bold pl-3 pr-2 rounded-lg shadow-md transition-all duration-300",
                      "grid-cols-[4rem_1fr_6rem] md:grid-cols-[5rem_1fr_7rem] py-3",
                      index === 0 &&
                        "bg-amber-500/75 outline-2 outline-amber-500 shadow-amber-500/50 ring-1 ring-offset-1 ring-offset-black ring-amber-400",
                      index === 1 &&
                        "bg-gray-500/75 outline-2 outline-gray-500 shadow-gray-500/50 ring-1 ring-offset-1 ring-offset-black ring-gray-400",
                      index === 2 &&
                        "bg-orange-500/75 outline-2 outline-orange-500 shadow-orange-500/50 ring-1 ring-offset-1 ring-offset-black ring-orange-400",
                      index > 2 &&
                        "bg-purple-500/25 outline-1 outline-purple-500 shadow-purple-500/30"
                    )}
                  >
                    <div className="flex items-center justify-start gap-2">
                      {medalIcon ? (
                        <span className="text-2xl">{medalIcon}</span>
                      ) : (
                        <span
                          className={clsx(
                            "font-bold drop-shadow-lg",
                            index === 0 && "text-amber-300",
                            index === 1 && "text-gray-300",
                            index === 2 && "text-orange-300",
                            index > 2 && "text-purple-300"
                          )}
                        >
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-full ">
                      <div className="flex items-center justify-center gap-2">
                        <LevelIndicator xp={climber.totalXp} size="xs" />
                        {climber.image ? (
                          <div
                            className={clsx(
                              "rounded-full overflow-hidden border-2 w-7 h-7 border-white/30"
                            )}
                          >
                            <Image
                              src={climber.image}
                              alt={climber.username || ""}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-7 "
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={clsx(
                          "no-wrap truncate font-barlow font-bold drop-shadow-lg max-w-xs text-xs"
                        )}
                      >
                        {climber.username ? climber.username : climber.id}
                      </span>
                      <div />
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1">
                      <span className="flex items-center justify-center text-center text-green-400 rounded-full bg-slate-900/60 px-3 py-1 border border-green-400/50 drop-shadow-lg font-bold text-sm">
                        {shortenXp(climber.totalXp)} XP
                      </span>
                    </div>
                  </div>
                );
              })
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
