"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { findCommunityGradeForRoute, getBoulderGradeMapping, isGradeHigher } from "@/lib/route";
import { RouteAttempt, RouteCompletion, User } from "@prisma/client";
import { CommunityGrade } from "@prisma/client";
import { calculateCompletionXpForRoute } from "@/lib/route";

export default function RouteTile({
  user,
  id,
  color,
  name,
  grade,
  isArchived,
  onData,
  completions,
  attempts,
  communityGrades,
  bonusXp = 0,
}: {
  user: User;
  id: string;
  color: string;
  name: string;
  grade: string;
  isSearched: boolean;
  isArchived: boolean;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    completions: RouteCompletion[],
    attempts: RouteAttempt[],
    userGrade: string | null,
    communityGrade: string,
    xp: { xp: number; baseXp: number; xpExtrapolated: { type: string; xp: number }[] } | null,
    isArchived: boolean,
    bonusXp?: number
  ) => void;

  completions: RouteCompletion[];
  attempts: RouteAttempt[];
  communityGrades: CommunityGrade[];
  bonusXp?: number;
}) {
  const [gradeMapped, setGradeMapped] = useState("");
  const [sends, setSends] = useState(completions.length);
  const [communityGrade, setCommunityGrade] = useState<string>(
    grade.toLowerCase() === "vfeature" || grade.toLowerCase() === "5.feature"
      ? "none"
      : findCommunityGradeForRoute(communityGrades)
  );
  const [xp, setXp] = useState<{
    xp: number;
    baseXp: number;
    xpExtrapolated: { type: string; xp: number }[];
  } | null>(null);

  let routeType = "boulder";
  if (grade.startsWith("5")) {
    routeType = "rope";
  }

  useEffect(() => {
    if (grade.startsWith("v")) {
      setGradeMapped(getBoulderGradeMapping(grade));
    } else {
      setGradeMapped(grade);
    }
  }, [grade]);

  useEffect(() => {
    setSends(completions.length);
  }, [completions]);

  useEffect(() => {
    if (user && !isArchived) {
      setXp(
        calculateCompletionXpForRoute({
          grade,
          previousCompletions: sends,
          newHighestGrade: isGradeHigher(user as User, grade, routeType),
          bonusXp: bonusXp || 0,
        })
      );
    } else if (isArchived) {
      setXp(null);
    }
  }, [grade, user, sends, isArchived, bonusXp]);

  let userGrade: string | null = null;
  if (user && grade.toLowerCase() !== "vfeature" && grade.toLowerCase() !== "5.feature") {
    userGrade = communityGrades.find(grade => grade.userId === user.id)?.grade || null;
  }

  return (
    <button
      onClick={() =>
        onData(
          id,
          name,
          grade,
          color,
          completions,
          attempts,
          userGrade,
          communityGrade,
          xp,
          isArchived,
          bonusXp
        )
      }
      className={clsx(
        "w-xs md:w-md rounded flex outline-2 justify-between items-center p-2 relative",
        {
          "bg-green-400/25  outline-green-400": color === "green",
          "bg-red-400/25  outline-red-400": color === "red",
          "bg-blue-400/25  outline-blue-400": color === "blue",
          "bg-yellow-400/25  outline-yellow-400": color === "yellow",
          "bg-purple-400/25  outline-purple-400": color === "purple",
          "bg-orange-400/25  outline-orange-400": color === "orange",
          "bg-white/35  outline-white-400": color === "white",
          "bg-slate-900/25  outline-white": color === "black",
          "bg-pink-400/25  outline-pink-400": color === "pink",
        }
      )}
    >
      <div className="flex flex-col font-barlow max-w-[70%]">
        <p className="text-white text-xl font-bold  truncate ">
          {name}
          {/* {user && <span className="text-green-400 font-semibold italic">{xp?.baseXp}xp</span>} */}
        </p>
        <p className="text-md italic place-self-start">{gradeMapped}</p>
      </div>
      {user && (
        <div className="flex gap-2 absolute -top-4 -right-4 ">
          {isArchived && (
            <div className="backdrop-blur-xs outline outline-gray-400 rounded-full size-9 flex justify-center items-center shadow ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 stroke-2 "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </div>
          )}
          {sends > 0 && (
            <div className="backdrop-blur-xs outline outline-green-400 rounded-full size-9 flex justify-center items-center shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 stroke-3 stroke-green-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          )}
          {!isArchived && xp && (
            <p className="text-lg font-extrabold italic font-barlow text-green-400 font  backdrop-blur-xs outline outline-green-400 rounded-full p-0.5 px-3">
              {xp.xp}xp
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        {/* {sends > 0 && (
          <div className="bg-green-400 rounded-full size-9 flex justify-center items-center shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 stroke-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        )} */}
      </div>
    </button>
  );
}
