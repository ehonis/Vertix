import { Suspense } from "react";
import prisma from "@/prisma";
import { getAllGradeCounts } from "@/lib/homepage";
import ElementLoadingAnimation from "../general/element-loading-animation";
import ClientGraphs from "./client-graphs";

export default function GymStatsSlide({
  boulderGradeCounts,
  ropeGradeCounts,
  ropeTotal,
  boulderTotal,
}: {
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
}) {
  return (
    <div className="text-white font-barlow bg-black flex flex-col items-start gap-3">
      <div className="flex flex-col items-start justify-start z-10 mr-20 ">
        <p className="text-white font-jost text-8xl">Vertix</p>
        <p className="text-white font-barlow text-md -mt-5 ml-12">
          All of your climbing data, in one place
        </p>
      </div>
      <ClientGraphs
        boulderCounts={boulderGradeCounts}
        ropeCounts={ropeGradeCounts}
        ropeTotal={ropeTotal}
        boulderTotal={boulderTotal}
      />
    </div>
  );
}
