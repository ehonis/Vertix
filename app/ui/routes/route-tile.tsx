import clsx from "clsx";
import Link from "next/link";
export default function RouteTile({
  id,
  color,
  name,
  grade,
  isSearched,
  isArchived,
}: {
  id: string;
  color: string;
  name: string;
  grade: string;
  isSearched: boolean;
  isArchived: boolean;
}) {
  return (
    <Link
      href={`/routes/${id}`}
      className={clsx("w-xs md:w-md rounded-xs flex outline-2 justify-between", {
        "bg-green-400/25  outline-green-400": color === "green",
        "bg-red-400/25  outline-red-400": color === "red",
        "bg-blue-400/25  outline-blue-400": color === "blue",
        "bg-yellow-400/25  outline-yellow-400": color === "yellow",
        "bg-purple-400/25  outline-purple-400": color === "purple",
        "bg-orange-400/25  outline-orange-400": color === "orange",
        "bg-white/25  outline-white-400": color === "white",
        "bg-slate-900/25  outline-white": color === "black",
        "bg-pink-400/25  outline-pink-400": color === "pink",
      })}
    >
      <div className="flex flex-col pt-1 pl-2 font-barlow">
        <p className="text-white text-lg font-bold break-words whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {name}
        </p>
        <p className="text-md italic">{grade}</p>
      </div>
      {isSearched && (
        <div className={clsx("place-self-center pr-2 font-barlow text-sm")}>
          {isArchived ? "Archived" : "Current"}
        </div>
      )}
    </Link>
  );
}
