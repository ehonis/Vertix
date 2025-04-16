"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { getBoulderGradeMapping } from "@/lib/route";
export default function RouteTile({
  id,
  color,
  name,
  grade,
  isArchived,
  onData,
  isCompleted,
}: {
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
    isCompleted: boolean
  ) => void;
  isCompleted: boolean;
}) {
  const [gradeMapped, setGradeMapped] = useState("");
  useEffect(() => {
    if (grade.startsWith("v")) {
      setGradeMapped(getBoulderGradeMapping(grade));
    } else {
      setGradeMapped(grade);
    }
  }, [grade]);

  return (
    <button
      onClick={() => onData(id, name, grade, color, isCompleted)}
      className={clsx("w-xs md:w-md rounded flex outline-2 justify-between items-center p-2", {
        "bg-green-400/35  outline-green-400": color === "green",
        "bg-red-400/35  outline-red-400": color === "red",
        "bg-blue-400/35  outline-blue-400": color === "blue",
        "bg-yellow-400/35  outline-yellow-400": color === "yellow",
        "bg-purple-400/35  outline-purple-400": color === "purple",
        "bg-orange-400/35  outline-orange-400": color === "orange",
        "bg-white/35  outline-white-400": color === "white",
        "bg-slate-900/35  outline-white": color === "black",
        "bg-pink-400/35  outline-pink-400": color === "pink",
      })}
    >
      <div className="flex flex-col font-barlow max-w-[70%]">
        <p className="text-white text-xl font-bold  truncate ">{name}</p>
        <p className="text-md italic place-self-start">{gradeMapped}</p>
      </div>
      <div className="flex gap-2">
        {isArchived && (
          <div className="bg-gray-500 rounded-full size-9 flex justify-center items-center shadow ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
          </div>
        )}
        {isCompleted && (
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
        )}
      </div>
    </button>
  );
}
