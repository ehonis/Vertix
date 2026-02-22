"use client";

import { splitRoutesByType } from "@/lib/dashboard-shared";
import { RouteType } from "@/generated/prisma/browser";
import { ResponsiveContainer, PieChart, Pie, Legend, Tooltip } from "recharts";
import { RouteCompletion } from "@/generated/prisma/browser";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

// Define the type for the tooltip payload
type TooltipPayload = {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    fill: string;
  };
}[];

// Define the props type for CustomTooltip
type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div
        className={clsx(
          " p-2 rounded-lg",
          name === "Boulder" && "bg-purple-700/45 outline outline-purple-700",
          name === "Rope" && "bg-blue-700/45 outline outline-blue-700"
        )}
      >
        <p className="text-white font-bold">{name}</p>
        <p className="text-white">{value} routes</p>
      </div>
    );
  }
  return null;
}

export default function TypePieChart({
  completionData,
}: {
  completionData: (RouteCompletion & { route: { type: RouteType; grade: string } })[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { boulderRoutes, ropeRoutes } = splitRoutesByType(completionData);

  // Define colors for each route type
  const routeColors = {
    Boulder: "#9810FA", // A warm red color for boulders
    Rope: "#155DFC", // A cool teal color for ropes
  };

  const data01 = [
    { name: "Boulder", value: boulderRoutes.length, fill: routeColors.Boulder },
    { name: "Rope", value: ropeRoutes.length, fill: routeColors.Rope },
  ];

  return (
    <>
      {/* Original chart */}
      <motion.div
        className="w-full h-44 bg-slate-900 rounded-lg p-3 flex flex-col relative cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-full h-full">
          <h1 className="text-white font-bold text-start mb-0">By Type</h1>
          <ResponsiveContainer width="100%" height="100%" className="cursor-pointer -mt-2">
            <PieChart>
              <Pie
                data={data01}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                labelLine={false}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900 rounded-lg p-3 flex flex-col items-center h-[22rem] w-xs"
              onClick={e => e.stopPropagation()}
            >
              <h1 className="text-white font-bold text-xl text-center mb-2">
                Completed Routes by Type
              </h1>
              <div className="w-full h-[calc(100%-2rem)] flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%" className="-mt-4">
                    <PieChart>
                      <Pie
                        data={data01}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      />
                      <Legend />
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
