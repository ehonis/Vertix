import prisma from '@/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RoutePieChart from '@/app/ui/profile/dashboard/route-pie-chart';
import RouteLineChart from '@/app/ui/profile/dashboard/route-line-chart';
import ConstructionBlur from '@/app/ui/general/construction-blur';
import {
  getLineChartCompletionsData,
  getPieChartCompletionsData,
  getRouteCompletions,
} from '@/lib/routeCompletions';

export default async function Dashboard({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
    return;
  }
  const { slug } = await params;

  if (!slug) {
    redirect('/404');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: slug },
  });

  if (!user || user.username !== session?.user?.username) {
    redirect('/signin');
    return;
  }
  console.log(session?.user?.id);
  const pieChartCompletionsData = await getPieChartCompletionsData(
    user.username
  );
  const lineChartData = await getRouteCompletions(user.username);

  return (
    <div className="flex flex-col p-5 gap-5 w-screen">
      <ConstructionBlur />
      <h1 className="text-white font-bold text-3xl">
        {user.name}&apos;s Dashboard
      </h1>
      <div className="flex md:flex-row flex-col gap-5 w-full ">
        <RoutePieChart userData={pieChartCompletionsData} />
        <RouteLineChart completedRoutes={lineChartData} />
      </div>
    </div>
  );
}
