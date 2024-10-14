import prisma from '@/lib/prisma';
import RouteChart from './ui/route-chart';
import TextHeader from './ui/text-header';

async function getRoutes() {
  const posts = await prisma.Route.findMany();
  return posts;
}

export default async function Home() {
  const posts = await getRoutes();

  return (
    <div>
      <TextHeader text="Current Routes" />
      <div className="flex justify-between">
        <RouteChart data={posts} type="boulder" />
        <RouteChart data={posts} type="rope" />
      </div>
    </div>
  );
}
