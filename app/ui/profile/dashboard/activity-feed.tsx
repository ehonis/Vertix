import clsx from "clsx";
import Link from "next/link";
import { getAttemptsData, getCompletionData } from "@/lib/dashboard";
import type { AppRouteAttempt, AppRouteCompletion } from "@/lib/appTypes";

function isCompletion(
  activity: AppRouteCompletion | AppRouteAttempt
): activity is AppRouteCompletion {
  return "completionDate" in activity;
}

export default async function ActivityFeed({ username }: { username: string }) {
  const completionData = await getCompletionData(username);
  const attemptsData = await getAttemptsData(username);
  const data = [...completionData, ...attemptsData].filter(
    activity =>
      activity.route && (isCompletion(activity) ? activity.completionDate : activity.attemptDate)
  ) as Array<AppRouteCompletion | AppRouteAttempt>;
  data.sort((a, b) => {
    const dateA = isCompletion(a)
      ? (a.completionDate ?? new Date(0))
      : (a.attemptDate ?? new Date(0));
    const dateB = isCompletion(b)
      ? (b.completionDate ?? new Date(0))
      : (b.attemptDate ?? new Date(0));
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Group activities by date
  const groupedData = data.slice(0, 20).reduce(
    (groups, activity) => {
      const activityDate = isCompletion(activity)
        ? (activity.completionDate ?? new Date(0))
        : (activity.attemptDate ?? new Date(0));
      const dateKey = activityDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
      return groups;
    },
    {} as Record<string, typeof data>
  );

  return (
    <div className="text-white font-barlow ">
      <div className="flex flex-col gap-3 h-72 px-3 py-2 bg-slate-900 rounded-md w-full overflow-y-auto overflow-x-hidden">
        {Object.entries(groupedData).map(([date, activities]) => (
          <div key={date} className="flex flex-col gap-2">
            {/* Date separator */}
            <div className="flex items-center gap-2">
              <div className="h-[1px] bg-gray-500 flex-1"></div>
              <p className=" text-gray-400 font-barlow text-lg font-medium px-2">{date}</p>
              <div className="h-[1px] bg-gray-500 flex-1"></div>
            </div>

            {/* Activities for this date */}
            {activities.map(activity => {
              const activityType = isCompletion(activity) ? "Tick" : "Attempt";
              const activityDate = isCompletion(activity)
                ? (activity.completionDate ?? new Date(0))
                : (activity.attemptDate ?? new Date(0));
              const route = activity.route!;
              return (
                <Link
                  href={`/routes/${route.id}`}
                  key={activity.id}
                  className={clsx("flex justify-between items-center bg-gray-700 rounded-md p-2", {
                    "bg-green-400/35 outline outline-green-400": route.color === "green",
                    "bg-red-400/35 outline outline-red-400": route.color === "red",
                    "bg-blue-400/35 outline outline-blue-400": route.color === "blue",
                    "bg-yellow-400/35 outline outline-yellow-400": route.color === "yellow",
                    "bg-purple-400/35 outline outline-purple-400": route.color === "purple",
                    "bg-orange-400/35 outline outline-orange-400": route.color === "orange",
                    "bg-white/35 outline outline-white": route.color === "white",
                    "bg-slate-900/35 outline outline-white": route.color === "black",
                    "bg-pink-400/35 outline outline-pink-400": route.color === "pink",
                  })}
                >
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">{route.title}</p>
                    <p className="">{route.grade}</p>
                    <p className="text-xs">{activityType}</p>
                  </div>
                  <p>
                    {activityDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              );
            })}
          </div>
        ))}
        <div className="h-[2px] w-full bg-white"></div>
      </div>
    </div>
  );
}
