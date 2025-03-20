import prisma from "@/prisma";
import RouteChart from "./route-chart";
import TextHeader from "./text-header";

export const revalidate = 60;

async function getRoutes() {
  const routes = await prisma.Route.findMany();
  return routes;
}

export default async function frontPageRouteCharts() {
  const routes = await getRoutes();

  return (
    <div>
      <TextHeader text="Current Routes" />
      <div className="flex md:flex-row flex-col justify-between">
        <RouteChart data={routes} type="boulder" />
        <RouteChart data={routes} type="rope" />
      </div>
    </div>
  );
}
