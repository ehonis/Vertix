import { Suspense } from "react";
import prisma from "@/prisma";
import { getAllGradeCounts } from "@/lib/homepage";
import ElementLoadingAnimation from "../general/element-loading-animation";
import ClientRouteGraphs from "./client-route-graphs";

export const revalidate = 1000;

async function RoutesGraph() {
  const routes = await prisma.route.findMany({
    where: { isArchive: false },
  });
  const { boulderGradeCounts, ropeGradeCounts, ropeTotal, boulderTotal } =
    getAllGradeCounts(routes);
  return (
    <div>
      <ClientRouteGraphs
        boulderCounts={boulderGradeCounts}
        ropeCounts={ropeGradeCounts}
        ropeTotal={ropeTotal}
        boulderTotal={boulderTotal}
      />
    </div>
  );
}

export default function LandingPageGraphs() {
  return (
    <div className="text-white font-barlow bg-black flex flex-col items-center py-10">
      <h1 className="md:text-5xl text-4xl font-bold md:mb-5 mb-2 text-center">Gym Routes Stats</h1>
      <Suspense fallback={<ElementLoadingAnimation />}>
        <RoutesGraph />
      </Suspense>
    </div>
  );
}
