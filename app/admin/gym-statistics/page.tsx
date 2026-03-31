import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import ClientGraph from "@/app/ui/admin/gym-statistics/client-graph";
import type { RouteStatsRoute } from "@/lib/routeStats";

export const dynamic = "force-dynamic";

const getCurrentRopesABExcluded = async () => {
  const routes = await getAllRoutes();
  return routes.filter(
    route => !route.isArchive && route.type === "ROPE" && route.location !== "ABWall"
  );
};

const getCurrentBoulders = async () => {
  const routes = await getAllRoutes();
  return routes.filter(route => !route.isArchive && route.type === "BOULDER");
};
const getAutoBelayRoutes = async () => {
  const routes = await getAllRoutes();
  return routes.filter(
    route => !route.isArchive && route.type === "ROPE" && route.location === "ABWall"
  );
};

async function getAllRoutes(): Promise<Array<RouteStatsRoute & { location: string }>> {
  const result = await createConvexServerClient().query(api.routes.searchRoutes, {
    text: "",
    take: 10000,
    skip: 0,
  });

  return result.data.map(route => ({
    id: route.id,
    title: route.title,
    grade: route.grade,
    type: route.type,
    color: route.color,
    setDate: new Date(route.setDate),
    isArchive: route.isArchive,
    location: route.location,
  }));
}

export default async function GymStatistics() {
  const currentRopesABExcluded = await getCurrentRopesABExcluded();
  const currentBoulders = await getCurrentBoulders();
  const autoBelayRoutes = await getAutoBelayRoutes();
  return (
    <div className="w-screen p-5 flex flex-col items-center">
      <div className="md:w-auto flex-col flex gap-5">
        <h1 className="text-white font-barlow font-bold text-4xl mb-5">Gym Statistics</h1>
        <div>
          <h2 className="text-white font-barlow font-bold text-xl mb-2">Current Ropes</h2>
          <ClientGraph routes={currentRopesABExcluded} fillColor="#155DFC" />
        </div>
        <div>
          <h2 className="text-white font-barlow font-bold text-xl mb-2">Current Boulders</h2>
          <ClientGraph routes={currentBoulders} fillColor="#9810FA" />
        </div>
        <div>
          <h2 className="text-white font-barlow font-bold text-xl mb-2">Auto Belay Routes</h2>
          <ClientGraph routes={autoBelayRoutes} fillColor="#155DFC" />
        </div>
      </div>
    </div>
  );
}
