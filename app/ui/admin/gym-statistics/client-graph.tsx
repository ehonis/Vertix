"use client";

import { getAllGradeCounts } from "@/lib/homepage";
import { Route, RouteType } from "@/generated/prisma/browser";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDateMMDD } from "@/lib/date";

export default function ClientGraph({ routes, fillColor }: { routes: Route[]; fillColor: string }) {
  const { boulderGradeCounts, ropeGradeCounts, ropeTotal, boulderTotal } =
    getAllGradeCounts(routes);

  let counts;
  if (ropeTotal > 0) {
    counts = ropeGradeCounts;
  } else {
    counts = boulderGradeCounts;
  }
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);

  const handleBarClick = (data: { grade: string; count: number } | null) => {
    if (data && data.grade) {
      setSelectedGrade(data.grade);
      setSelectedRoutes(routes.filter(route => route.grade === data.grade));
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="md:w-5xl md:h-96 bg-slate-900 rounded-lg md:p-10 w-[22rem] h-56 p-3 pt-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={counts}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
            <XAxis dataKey="grade" stroke="white" height={20} />
            <YAxis
              stroke="white"
              width={20}
              domain={[0, "dataMax"]}
              tickCount={Math.max(...counts.map(item => item.count)) + 1}
              allowDecimals={false}
            />

            <Bar
              dataKey="count"
              name="Rope Counts"
              fill={fillColor}
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedGrade && (
        // <div className="text-white mb-2 text-sm">
        //   Selected Grade: <span className="font-bold text-blue-400">{selectedGrade}</span>
        // </div>
        <div className="md:w-[62rem]  bg-slate-900 rounded-lg md:p-10 w-[21rem] h-full p-3 pt-4 pr-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-white font-barlow font-bold text-xl mb-2">
                {selectedGrade} Routes
              </h2>
              <button onClick={() => setSelectedGrade(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8 stroke-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedRoutes.map(route => (
              <Link
                href={`/admin/manager/routes/${route.id}`}
                key={route.id}
                className={clsx(
                  "flex justify-between items-center text-white mb-2 text-sm outline rounded-md p-2",
                  {
                    "bg-green-400/25 outline-green-400": route.color === "green",
                    "bg-red-400/25 outline-red-400": route.color === "red",
                    "bg-blue-400/25 outline-blue-400": route.color === "blue",
                    "bg-yellow-400/25 outline-yellow-400": route.color === "yellow",
                    "bg-purple-400/25 outline-purple-400": route.color === "purple",
                    "bg-orange-400/25 outline-orange-400": route.color === "orange",
                    "bg-white/25 outline-white": route.color === "white",
                    "bg-slate-900/25 outline-white": route.color === "black",
                    "bg-pink-400/25 outline-pink-400": route.color === "pink",
                    "bg-gray-400/25 outline-gray-400": route.color === "gray",
                    "bg-black/25 outline-white": route.color === "black",
                  }
                )}
              >
                <p className="text-white font-barlow font-bold">{route.title}</p>
                <p className="text-white font-barlow font-bold">{formatDateMMDD(route.setDate)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
