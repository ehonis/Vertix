"use client";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

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

export default function ClientGraphs({
  boulderCounts,
  ropeCounts,
  ropeTotal,
  boulderTotal,
}: {
  boulderCounts: { grade: string; count: number }[];
  ropeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
}) {
  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex items-center gap-2">
        <div className="w-20 flex items-center justify-center">
          <h2 className="text-white font-bold text-4xl rotate-270 whitespace-nowrap">
            Boulders <span className="text-xl">{`(${boulderTotal})`}</span>
          </h2>
        </div>
        <div className="h-80 w-6xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={boulderCounts}
              margin={{ top: 20, right: 0, left: -40, bottom: -20 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis
                type="category"
                dataKey="grade"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={20}
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <YAxis
                type="number"
                dataKey="count"
                allowDecimals={false}
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <Bar
                dataKey="count"
                fill="#a855f7"
                fillOpacity={0.5}
                stroke="#a855f7"
                strokeWidth={1}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 flex items-center justify-center">
          <h2 className="text-white font-bold text-4xl rotate-270 whitespace-nowrap">
            Ropes <span className="text-xl">{`(${ropeTotal})`}</span>
          </h2>
        </div>
        <div className="h-80 w-6xl py-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ropeCounts}
              margin={{ top: 20, right: 0, left: -40, bottom: -20 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis
                type="category"
                dataKey="grade"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={20}
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <YAxis
                type="number"
                dataKey="count"
                allowDecimals={false}
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                fillOpacity={0.5}
                stroke="#3b82f6"
                strokeWidth={1}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
