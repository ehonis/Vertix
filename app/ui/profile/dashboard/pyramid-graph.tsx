"use client";

import { RouteCompletion, RouteType } from "@prisma/client";
import { useState, useEffect } from "react";
import { splitRoutesByType, getRouteGradeCounts } from "@/lib/dashboard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import clsx from "clsx";
type TooltipPayload = {
  name: string;
  value: number;
  payload: {
    grade: string;
    count: number;
  };
}[];

// Define the props type for CustomTooltip
type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length && payload[0].payload.count > 0) {
    const { grade, count } = payload[0].payload;
    return (
      <div className="px-4 py-1 rounded-lg bg-blue-700/45 outline outline-blue-700 text-center">
        <p className="text-white font-bold">{grade}</p>
        <p className="text-white">{count} ticks</p>
      </div>
    );
  }
  return null;
}
export default function PyramidGraph({
  completionData,
}: {
  completionData: (RouteCompletion & { route: { type: RouteType; grade: string } })[];
}) {
  const [displayedGradeCounts, setDisplayedGradeCounts] = useState<
    { grade: string; count: number }[]
  >([]);
  const [isBoulder, setIsBoulder] = useState(true);
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(completionData);
  const { boulderGradeCounts, ropeGradeCounts } = getRouteGradeCounts(ropeRoutes, boulderRoutes);

  const handleRouteTypeChange = (isBoulder: boolean) => {
    if (isBoulder) {
      setDisplayedGradeCounts(boulderGradeCounts);
      setIsBoulder(true);
    } else {
      setDisplayedGradeCounts(ropeGradeCounts);
      setIsBoulder(false);
    }
  };

  useEffect(() => {
    handleRouteTypeChange(isBoulder);
  }, [isBoulder]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg p-5 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold font-barlow">Tix by Grade</h1>
        <select
          name=""
          id=""
          value={isBoulder ? "boulder" : "rope"}
          onChange={e => handleRouteTypeChange(e.target.value === "boulder")}
          className="bg-blue-600/15 outline outline-blue-600 text-white rounded-lg px-3 py-1 cursor-pointer"
        >
          <option value="boulder">Boulder</option>
          <option value="rope">Rope</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={displayedGradeCounts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#364153" />
          <XAxis dataKey="grade" tickFormatter={value => value.toUpperCase()} />
          <YAxis
            dataKey="count"
            width={25}
            allowDecimals={false} // Ensure only whole number ticks
          />
          <Bar dataKey="count" fill="#155DFC" />
          <Tooltip content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
