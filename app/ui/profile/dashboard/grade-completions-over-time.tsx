"use client";

import clsx from "clsx";
import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  YAxis,
  XAxis,
  ResponsiveContainer,
} from "recharts";

import { motion, AnimatePresence } from "framer-motion";

import { useState } from "react";
import { RouteCompletion, RouteType } from "@prisma/client";
import { getLineChartCompletionsData } from "@/lib/dashboard";
type TooltipPayload = {
  name: string;
  value: number;
  payload: {
    day: string;
    boulderCount: number;
    ropeCount: number;
  };
}[];

// Define the props type for CustomTooltip
type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const { day, boulderCount, ropeCount } = payload[0].payload;
    return (
      <div className=" p-2 rounded-lg bg-blue-700/45 outline outline-blue-700">
        <p className="text-white font-bold">{day}</p>
        <p className="text-white">{boulderCount} boulder routes</p>
        <p className="text-white">{ropeCount} rope routes</p>
      </div>
    );
  }
  return null;
}
type TimeFrame = "allTime" | "weekToDate" | "monthToDate" | "yearToDate";
export default function GradeCompletionsOverTime({
  completionData,
}: {
  completionData: (RouteCompletion & { route: { type: RouteType; grade: string } })[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime");
  const lineChartData = getLineChartCompletionsData(completionData, timeFrame);
  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setTimeFrame(timeFrame);
  };
  return (
    <>
      <motion.div
        className="w-full h-44 bg-slate-900 rounded-lg p-3 flex flex-col relative cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-full h-full">
          <h1 className="text-white font-bold text-start mb-0">By Date</h1>
          <ResponsiveContainer width="100%" height="70%">
            <LineChart width={300} height={100} data={lineChartData.breakdown}>
              <Line
                type="monotone"
                dataKey="boulderCount"
                stroke="#9810FA"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ropeCount"
                stroke="#155DFC"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
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
              className="bg-slate-900 rounded-lg p-3 flex flex-col items-center h-[22rem] w-full mx-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex w-full justify-between">
                <div className="flex flex-col">
                  <h1 className="text-white font-bold text-xl">Completed Routes by Time Frame</h1>
                  <p className="text-gray-400 italic text-sm mb-5">
                    Turn your phone sideways to get a better view
                  </p>
                </div>
                <button
                  className=" cursor-pointer place-self-start"
                  onClick={() => setIsExpanded(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-10 stroke-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="w-full h-[calc(100%-2rem)] flex flex-col p-2">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%" className="-mt-4">
                    <LineChart
                      data={lineChartData.breakdown}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#364153" />
                      <YAxis width={20} allowDecimals={false} />
                      <XAxis dataKey="day" />

                      <Line
                        dataKey="boulderCount"
                        stroke="#9810FA"
                        strokeWidth={2}
                        dot={false}
                        type="monotone"
                      />
                      <Line
                        dataKey="ropeCount"
                        stroke="#155DFC"
                        strokeWidth={2}
                        dot={false}
                        type="monotone"
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <select
                name=""
                id=""
                value={timeFrame}
                onChange={e => handleTimeFrameChange(e.target.value as TimeFrame)}
                className="bg-blue-600/15 outline outline-blue-600 text-white rounded-lg px-3 py-1 cursor-pointer"
              >
                <option value="weekToDate">Week to Date</option>
                <option value="monthToDate">Month to Date</option>
                <option value="yearToDate">Year to Date</option>
                <option value="allTime">All Time</option>
              </select>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
