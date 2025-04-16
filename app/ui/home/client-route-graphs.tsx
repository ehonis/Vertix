"use client";
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function ClientRouteGraphs({
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
    <div className=" flex flex-col gap-10">
      <div className="flex flex-col gap-0.5 md:gap-2">
        <h2 className="text-white font-bold md:text-4xl text-3xl ">
          Boulders <span className="text-xl">{`(${boulderTotal})`}</span>
        </h2>
        <div className="md:w-5xl md:h-96 bg-slate-900 rounded-lg md:p-10 w-[22rem] h-48 p-3 pt-4 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boulderCounts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis dataKey="grade" stroke="white" height={20} />
              <YAxis stroke="white" width={20} />

              <Bar dataKey="count" name="Boulder Routes" fill="#9810FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 md:gap-2">
        <h2 className="text-white font-bold md:text-4xl text-3xl ">
          Ropes <span className="text-xl">{`(${ropeTotal})`}</span>
        </h2>
        <div className="md:w-5xl md:h-96 bg-slate-900 rounded-lg md:p-10 w-[22rem] h-48 p-3 pt-4 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ropeCounts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-600" />
              <XAxis dataKey="grade" stroke="white" height={20} />
              <YAxis stroke="white" width={20} />

              <Bar dataKey="count" name="Rope Counts" fill="#155DFC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
