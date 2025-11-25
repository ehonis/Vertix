"use client";

import clsx from "clsx";
import LevelIndicator from "../general/level-indicator";
import Image from "next/image";
import VertixLogo from "./vertix-logo";

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
  const monthName = today.toLocaleString("default", { month: "long" });
  const headerText = `${monthName} XP Leaderboard`;

  const shortenXp = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
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
    <div className="flex flex-col w-full font-barlow text-white px-96 gap-6">
      <VertixLogo />
      <h1 className="text-start font-bold z-10 text-4xl xl:text-5xl 2xl:text-6xl">{headerText}</h1>
      <div className="flex flex-col z-10 gap-2">
        <div className="flex flex-col z-10 gap-4">
          {/* commented test users */}
          {/* <div
            key="testuser"
            className={clsx(
              "z-10",
              "grid w-full font-barlow font-bold pl-3 pr-1 rounded-md bg-blue-500/35 outline-1 outline-blue-500"
            )}
            style={{
              gridTemplateColumns: "clamp(3rem, 4vw, 4rem) 1fr clamp(4rem, 5vw, 5rem)",
              paddingTop: "clamp(0.75rem, 1vw, 1rem)",
              paddingBottom: "clamp(0.75rem, 1vw, 1rem)",
            }}
          >
            <span
              className="text-start place-self-center font-bold drop-shadow-custom-black"
              style={{ fontSize: "clamp(2rem, 3rem, 4rem)" }}
            >
              {2}
            </span>
            <div
              className="flex items-center justify-center"
              style={{ gap: "clamp(0.375rem, 0.5vw, 0.5rem)" }}
            >
              <LevelIndicator xp={1000000} size="md" />
              <div
                style={{
                  width: "clamp(1.5rem, 2.25vw, 2.25rem)",
                  height: "clamp(1.5rem, 2.25vw, 2.25rem)",
                }}
              >
                <Image
                  src="https://github.com/shadcn.png"
                  alt="testuser"
                  width={36}
                  height={36}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>

              <span
                className="no-wrap truncate font-barlow font-bold drop-shadow-custom-black"
                style={{
                  fontSize: "clamp(2rem, 3rem, 4rem)",
                  maxWidth: "clamp(20rem, 25rem, 30rem)",
                }}
              >
                testuser
              </span>
            </div>
            <span
              className="flex items-center justify-center text-center text-green-400 mr-5 drop-shadow-custom-black"
              style={{
                fontSize: "clamp(2rem, 3rem, 4rem)",
              }}
            >
              {shortenXp(1000000)}
            </span>
          </div>
          <div
            key="testuser"
            className={clsx(
              "z-10",
              "grid w-full font-barlow font-bold pl-3 pr-1 rounded-md bg-blue-500/35 outline-1 outline-blue-500"
            )}
            style={{
              gridTemplateColumns: "clamp(3rem, 4vw, 4rem) 1fr clamp(4rem, 5vw, 5rem)",
              paddingTop: "clamp(0.75rem, 1vw, 1rem)",
              paddingBottom: "clamp(0.75rem, 1vw, 1rem)",
            }}
          >
            <span
              className="text-start place-self-center font-bold drop-shadow-custom-black"
              style={{ fontSize: "clamp(2rem, 3rem, 4rem)" }}
            >
              {2}
            </span>
            <div
              className="flex items-center justify-center"
              style={{ gap: "clamp(0.375rem, 0.5vw, 0.5rem)" }}
            >
              <LevelIndicator xp={1000000} size="md" />
              <div
                style={{
                  width: "clamp(1.5rem, 2.25vw, 2.25rem)",
                  height: "clamp(1.5rem, 2.25vw, 2.25rem)",
                }}
              >
                <Image
                  src="https://github.com/shadcn.png"
                  alt="testuser"
                  width={36}
                  height={36}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>

              <span
                className="no-wrap truncate font-barlow font-bold drop-shadow-custom-black"
                style={{
                  fontSize: "clamp(2rem, 3rem, 4rem)",
                  maxWidth: "clamp(20rem, 25rem, 30rem)",
                }}
              >
                testuser
              </span>
            </div>
            <span
              className="flex items-center justify-center text-center text-green-400 mr-5 drop-shadow-custom-black"
              style={{
                fontSize: "clamp(2rem, 3rem, 4rem)",
              }}
            >
              {shortenXp(1000000)}
            </span>
          </div>
          <div
            key="testuser"
            className={clsx(
              "z-10",
              "grid w-full font-barlow font-bold pl-3 pr-1 rounded-md bg-blue-500/35 outline-1 outline-blue-500"
            )}
            style={{
              gridTemplateColumns: "clamp(3rem, 4vw, 4rem) 1fr clamp(4rem, 5vw, 5rem)",
              paddingTop: "clamp(0.75rem, 1vw, 1rem)",
              paddingBottom: "clamp(0.75rem, 1vw, 1rem)",
            }}
          >
            <span
              className="text-start place-self-center font-bold drop-shadow-custom-black"
              style={{ fontSize: "clamp(2rem, 3rem, 4rem)" }}
            >
              {2}
            </span>
            <div
              className="flex items-center justify-center"
              style={{ gap: "clamp(0.375rem, 0.5vw, 0.5rem)" }}
            >
              <LevelIndicator xp={1000000} size="md" />
              <div
                style={{
                  width: "clamp(1.5rem, 2.25vw, 2.25rem)",
                  height: "clamp(1.5rem, 2.25vw, 2.25rem)",
                }}
              >
                <Image
                  src="https://github.com/shadcn.png"
                  alt="testuser"
                  width={36}
                  height={36}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>

              <span
                className="no-wrap truncate font-barlow font-bold drop-shadow-custom-black"
                style={{
                  fontSize: "clamp(2rem, 3rem, 4rem)",
                  maxWidth: "clamp(20rem, 25rem, 30rem)",
                }}
              >
                testuser
              </span>
            </div>
            <span
              className="flex items-center justify-center text-center text-green-400 mr-5 drop-shadow-custom-black"
              style={{
                fontSize: "clamp(2rem, 3rem, 4rem)",
              }}
            >
              {shortenXp(1000000)}
            </span>
          </div> */}
          {monthlyLeaderBoardData.length === 0 ? (
            <div className="text-center text-white font-barlow font-bold z-10 p-8">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-2xl xl:text-3xl 2xl:text-4xl">No monthly data available</div>
              <div className="text-lg xl:text-xl 2xl:text-2xl mt-2">
                Start climbing to appear on the leaderboard!
              </div>
            </div>
          ) : (
            monthlyLeaderBoardData.slice(0, 5).map((climber, index) => {
              const medalIcon = getMedalIcon(index);

              return (
                <div
                  key={climber.user.id}
                  className={clsx(
                    "z-10 w-full font-barlow font-bold pl-3 pr-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-between  py-3 xl:py-4 2xl:py-5",
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
                    {medalIcon ? (
                      <span className="text-6xl">{medalIcon}</span>
                    ) : (
                      <span
                        className={clsx(
                          "font-bold drop-shadow-lg text-xl xl:text-2xl 2xl:text-3xl",
                          index === 0 && "text-amber-300",
                          index === 1 && "text-gray-300",
                          index === 2 && "text-orange-300",
                          index > 2 && "text-blue-300"
                        )}
                      >
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-20 px-2 py-2 bg-slate-900/80 rounded-full w-2xl">
                    <div className="flex items-center justify-start gap-4">
                      <LevelIndicator xp={climber.user.totalXp} size="lg" />
                      {climber.user.image ? (
                        <div className="rounded-full overflow-hidden border-2 size-14 border-white/30">
                          <Image
                            src={climber.user.image}
                            alt={climber.user.username || ""}
                            width={72}
                            height={72}
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
                          className="size-14 "
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="no-wrap truncate font-barlow font-bold drop-shadow-lg max-w-md text-5xl">
                      {climber.user.username ? climber.user.username : climber.user.id}
                    </span>
                    <div />
                  </div>
                  <div className="flex flex-col items-end justify-center gap-1">
                    <span className="text-nowrap flex items-center justify-center text-center text-green-400 rounded-full bg-slate-900/80 px-4 py-2 border border-green-400/50 drop-shadow-lg font-bold  text-4xl">
                      {shortenXp(climber.xp)} XP
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at bottom right, #fd9a00 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
