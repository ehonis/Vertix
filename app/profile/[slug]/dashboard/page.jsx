import prisma from '@/prisma';
import RoutePieChart from '@/app/ui/profile/dashboard/route-pie-chart';

export default async function Dashboard({ params }) {
  const slug = (await params).slug;

  const user = await prisma.user.findUnique({
    where: {
      id: slug,
    },
  });

  return (
    <div className="flex flex-col p-5 gap-5">
      <h1 className="text-white font-bold text-3xl">Dashboard</h1>
      <div className="">
        <RoutePieChart />
      </div>
    </div>
  );
}
