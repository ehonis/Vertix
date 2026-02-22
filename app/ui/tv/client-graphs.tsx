"use client";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
    <div className="flex flex-col justify-between ">
      <div
        className="flex items-center w-[75vw] h-[30vh]"
        style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}
      >
        <div className="flex items-center justify-center w-20">
          <h2 className="text-white font-bold rotate-270 whitespace-nowrap text-6xl">
            Boulders <span className="text-4xl">{`(${boulderTotal})`}</span>
          </h2>
        </div>
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={boulderCounts}
              margin={{ top: 0, right: 0, left: 0, bottom: 75 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis
                type="category"
                dataKey="grade"
                angle={-45}
                textAnchor="end"
                width={120}
                className="text-4xl"
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <YAxis
                type="number"
                dataKey="count"
                allowDecimals={false}
                className="text-4xl"
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
      <div
        className="flex items-center w-[75vw] h-[30vh]"
        style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}
      >
        <div className="flex items-center justify-center w-20">
          <h2 className="text-white font-bold rotate-270 whitespace-nowrap text-6xl">
            Ropes <span className="text-4xl">{`(${ropeTotal})`}</span>
          </h2>
        </div>
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ropeCounts}
              margin={{ top: 0, right: 0, left: 0, bottom: 75 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis
                type="category"
                dataKey="grade"
                angle={-45}
                textAnchor="end"
                width={120}
                className="text-4xl"
                stroke="white"
                tick={{ fill: "white", fontWeight: "bold" }}
              />
              <YAxis
                type="number"
                dataKey="count"
                allowDecimals={false}
                className="text-4xl"
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
