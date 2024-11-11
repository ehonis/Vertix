import prisma from '@/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RoutePieChart from '@/app/ui/profile/dashboard/route-pie-chart';
import RouteLineChart from '@/app/ui/profile/dashboard/route-line-chart';
import {
  getLineChartCompletionsData,
  getPieChartCompletionsData,
} from '@/lib/routeCompletions';

export default async function Dashboard({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
    return;
  }

  const slug = params?.slug;

  if (!slug) {
    redirect('/404');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: slug },
  });

  if (!user || user.id !== session.user.id) {
    redirect('/signin');
    return;
  }

  const pieChartCompletionsData = await getPieChartCompletionsData(user.id);
  const lineChartCompletionsData = await getLineChartCompletionsData(user.id);

  return (
    <div className="flex flex-col p-5 gap-5 w-screen">
      <h1 className="text-white font-bold text-3xl">
        {user.name}&apos;s Dashboard
      </h1>
      <div className="flex md:flex-row flex-col gap-5 w-full ">
        <RoutePieChart userData={pieChartCompletionsData} />
        <RouteLineChart userData={lineChartCompletionsData} />
      </div>
    </div>
  );
}
