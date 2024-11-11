import prisma from '@/prisma';
import RouteChart from './ui/route-chart';
import TextHeader from './ui/text-header';

export const revalidate = 10;

async function getRoutes() {
  const routes = await prisma.Route.findMany();
  return routes;
}

export default async function Home() {
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
