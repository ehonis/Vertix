"use client";

import { RouteCompletion, RouteType } from "@/generated/prisma/browser";
import { useState, useEffect } from "react";
import { splitRoutesByType, getRouteGradeCounts } from "@/lib/dashboard-shared";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Type definitions for tooltip payload
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

/**
 * Helper function to extract the base grade from a grade string
 * For rope grades: "5.10+" -> "5.10", "5.11-" -> "5.11"
 * For boulder grades: returns as-is since they don't have +/- variants
 */

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
  // State to store the currently displayed grade counts
  const [displayedGradeCounts, setDisplayedGradeCounts] = useState<
    { grade: string; count: number }[]
  >([]);
  // State to track whether we're showing boulder or rope routes
  const [isBoulder, setIsBoulder] = useState(false);

  // Split the completion data by route type (boulder vs rope)
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(completionData);
  // Get grade counts for both boulder and rope routes
  const { boulderGradeCounts, ropeGradeCounts } = getRouteGradeCounts(ropeRoutes, boulderRoutes);

  /**
   * Handler function to switch between boulder and rope route displays
   * @param isBoulder - Boolean indicating whether to show boulder routes
   */
  const handleRouteTypeChange = (isBoulder: boolean) => {
    if (isBoulder) {
      setDisplayedGradeCounts(boulderGradeCounts);
      setIsBoulder(true);
    } else {
      setDisplayedGradeCounts(ropeGradeCounts);
      setIsBoulder(false);
    }
  };

  // Effect to initialize the display based on the current route type
  useEffect(() => {
    handleRouteTypeChange(isBoulder);
  }, [isBoulder]);

  return (
    <div className="w-full h-min bg-slate-900 rounded-lg p-5 flex flex-col gap-5">
      {/* Header section with title and route type selector */}
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

      {/* Chart container with responsive design */}
      <ResponsiveContainer width="100%" height={250} className="self-start">
        <BarChart
          data={displayedGradeCounts}
          margin={{ top: 20, right: 0, left: -40, bottom: -40 }}
          barCategoryGap="10%"
        >
          <XAxis
            type="category"
            dataKey="grade"
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            stroke="white"
          />
          {/* Y-axis shows the count values */}
          <YAxis type="number" dataKey="count" allowDecimals={false} stroke="white" />
          {/* Bar elements representing the count for each grade */}
          <Bar
            dataKey="count"
            fill={isBoulder ? "#a855f7" : "#3b82f6"}
            fillOpacity={0.25}
            stroke={isBoulder ? "#a855f7" : "#3b82f6"}
            strokeWidth={1}
            radius={[3, 3, 0, 0]}
          />
          {/* Custom tooltip showing the full grade name and count */}
          <Tooltip content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
