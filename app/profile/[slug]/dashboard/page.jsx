import prisma from '@/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RoutePieChart from '@/app/ui/profile/dashboard/route-pie-chart';
import RouteLineChart from '@/app/ui/profile/dashboard/route-line-chart';
export default async function Dashboard({ params }) {
  const session = await auth();
  const slug = (await params).slug;

  const user = await prisma.user.findUnique({
    where: {
      id: slug,
    },
  });

  if (user && user.id === session.user.id) {
    return (
      <div className="flex flex-col p-5 gap-5 w-sceen">
        <h1 className="text-white font-bold text-3xl">
          {user.name}'s Dashboard
        </h1>
        <div className="flex gap-5 w-full">
          <RoutePieChart />
          <RouteLineChart />
        </div>
      </div>
    );
  } else {
    redirect('/');
  }
}
