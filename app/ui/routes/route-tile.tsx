"use client";

import clsx from "clsx";
import Link from "next/link";
export default function RouteTile({
  id,
  color,
  name,
  grade,
  isSearched,
  isArchived,
  onData,
}: {
  id: string;
  color: string;
  name: string;
  grade: string;
  isSearched: boolean;
  isArchived: boolean;
  onData: (routeId: string, name: string, grade: string, color: string) => void;
}) {
  return (
    <button
      onClick={() => onData(id, name, grade, color)}
      className={clsx("w-xs md:w-md rounded flex outline-2 justify-between", {
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
      <div className="flex flex-col pt-1 pl-2 font-barlow">
        <p className="text-white text-xl font-bold break-words whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {name}
        </p>
        <p className="text-md italic place-self-start">{grade}</p>
      </div>
      {isSearched && (
        <div className={clsx("place-self-center pr-2 font-barlow text-sm")}>
          {isArchived ? "Archived" : "Current"}
        </div>
      )}
    </button>
  );
}
