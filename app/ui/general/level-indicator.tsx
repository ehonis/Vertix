import { getLevelForXp } from "@/lib/route-shared";
import clsx from "clsx";

export default function LevelIndicator({
  xp,
  size,
}: {
  xp: number;
  size: "lg" | "md" | "sm" | "xs";
}) {
  const level = getLevelForXp(xp);
  return (
    <div
      className={clsx(
        "flex items-center font-tomorrow justify-center rounded-full outline-2 bg-gray-900/80",
        size === "lg" && "!text-2xl size-8 p-6",
        size === "md" && "text-lg size-5 p-4",
        size === "sm" && "!text-sm size-4 p-3",
        size === "xs" && "!text-xs size-3 p-2",
        level >= 50 && "text-red-400 outline-red-400",
        level >= 30 && "text-yellow-400 outline-yellow-400 ",
        level >= 20 && "text-orange-400 outline-orange-400 ",
        level >= 10 && "text-green-400 outline-green-400 ",
        level < 10 && "text-blue-400 outline-blue-400 "
      )}
    >
      {level}
    </div>
  );
}
