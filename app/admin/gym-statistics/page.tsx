import prisma from "@/prisma";
import { Locations, RouteType } from "@prisma/client";
import ClientGraph from "@/app/ui/admin/gym-statistics/client-graph";

const getCurrentRopesABExcluded = async () => {
  const currentRoutes = await prisma?.route.findMany({
    where: {
      isArchive: false,
      location: {
        not: Locations.ABWall,
      },
      type: RouteType.ROPE,
    },
  });
  return currentRoutes;
};

const getCurrentBoulders = async () => {
  const currentBoulders = await prisma?.route.findMany({
    where: {
      isArchive: false,
      type: RouteType.BOULDER,
    },
  });
  return currentBoulders;
};
const getAutoBelayRoutes = async () => {
  const autoBelayRoutes = await prisma?.route.findMany({
    where: {
      isArchive: false,
      type: RouteType.ROPE,
      location: Locations.ABWall,
    },
  });
  return autoBelayRoutes;
};

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
