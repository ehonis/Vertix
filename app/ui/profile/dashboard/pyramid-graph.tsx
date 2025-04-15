"use client";

import { RouteCompletion, RouteType } from "@prisma/client";
import { useState, useEffect } from "react";
import { splitRoutesByType, getRouteGradeCounts } from "@/lib/dashboard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import clsx from "clsx";

export default function PyramidGraph({
  pyramidData,
}: {
  pyramidData: (RouteCompletion & { route: { type: RouteType; grade: string } })[];
}) {
  const [selectedRouteType, setSelectedRouteType] = useState<RouteType>(RouteType.BOULDER);
  const [displayedGradeCounts, setDisplayedGradeCounts] = useState<
    { grade: string; count: number }[]
  >([]);
  const [isBoulder, setIsBoulder] = useState(true);
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(pyramidData);
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
          className="bg-green-500/15 outline outline-green-500 text-white rounded-full px-3 py-1 cursor-pointer"
        >
          <option value="boulder">Boulder</option>
          <option value="rope">Rope</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={displayedGradeCounts}>
          <XAxis dataKey="grade" tickFormatter={value => value.toUpperCase()} />
          <YAxis dataKey="count" width={25} />
          <Bar dataKey="count" fill="#155DFC" />
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
