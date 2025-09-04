import { RouteAttempt, RouteCompletion, RouteType } from "@prisma/client";
import prisma from "@/prisma";
import clsx from "clsx";
import Link from "next/link";
export default async function ActivityFeed({ userId }: { userId: string }) {
  const completionData = await prisma.routeCompletion.findMany({
    where: {
      userId: userId,
    },
    include: {
      route: true,
    },
  });
  const attemptsData = await prisma.routeAttempt.findMany({
    where: {
      userId: userId,
    },
    include: {
      route: true,
    },
  });
  const data = [...completionData, ...attemptsData];
  data.sort((a, b) => {
    const dateA = "completionDate" in a ? a.completionDate : a.attemptDate;
    const dateB = "completionDate" in b ? b.completionDate : b.attemptDate;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Group activities by date
  const groupedData = data.slice(0, 20).reduce(
    (groups, activity) => {
      const activityDate =
        "completionDate" in activity ? activity.completionDate : activity.attemptDate;
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
              const activityType = "completionDate" in activity ? "Tick" : "Attempt";
              const activityDate =
                "completionDate" in activity ? activity.completionDate : activity.attemptDate;
              return (
                <Link
                  href={`/route/${activity.route.id}`}
                  key={activity.id}
                  className={clsx("flex justify-between items-center bg-gray-700 rounded-md p-2", {
                    "bg-green-400/35 outline outline-green-400": activity.route.color === "green",
                    "bg-red-400/35 outline outline-red-400": activity.route.color === "red",
                    "bg-blue-400/35 outline outline-blue-400": activity.route.color === "blue",
                    "bg-yellow-400/35 outline outline-yellow-400":
                      activity.route.color === "yellow",
                    "bg-purple-400/35 outline outline-purple-400":
                      activity.route.color === "purple",
                    "bg-orange-400/35 outline outline-orange-400":
                      activity.route.color === "orange",
                    "bg-white/35 outline outline-white": activity.route.color === "white",
                    "bg-slate-900/35 outline outline-white": activity.route.color === "black",
                    "bg-pink-400/35 outline outline-pink-400": activity.route.color === "pink",
                  })}
                >
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">{activity.route.title}</p>
                    <p className="">{activity.route.grade}</p>
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
