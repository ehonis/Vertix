'use server';

import Link from 'next/link';
import RoutePanels from '../../../ui/admin/route-panels';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const getRoutes = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-route`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        next: { revalidate: 1 }, // Move cache inside the options object
      }
    );

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export default async function Page() {
  const session = await auth();
  const user = session?.user || null;
  const routes = await getRoutes();

  if (!user || user.admin === false) {
    redirect('/signin');
  } else {
    try {
      const boulderRoutes = routes.data.filter(
        (route) => route.type === 'boulder'
      );
      const ropeRoutes = routes.data.filter((route) => route.type === 'rope');

      return (
        <>
          <Link href={'/admin'} className="flex gap-1 items-center mx-5 mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <p className="font-barlow text-xs text-white">Admin Center</p>
          </Link>
          <div className="flex justify-between items-center w-full px-5 pt-2 pb-5">
            <h1 className="text-white text-3xl font-bold">Route Manager</h1>
            <Link href={'/admin/create'}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#4ade80"
                className="size-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </Link>
          </div>
          <div className="bg-bg1 mx-5 rounded md:p-5 p-0 py-3">
            <h2 className="text-white text-2xl font-extrabold px-5">Ropes</h2>
            <div className="flex p-5">
              <RoutePanels routes={ropeRoutes} />
            </div>
          </div>
          <div className="bg-bg1 m-5 rounded md:p-5 p-0 py-3">
            <h2 className="text-white text-2xl font-extrabold px-5">
              Boulders
            </h2>
            <div className="flex gap-5 p-5">
              <RoutePanels routes={boulderRoutes} />
            </div>
          </div>
        </>
      );
    } catch {
      return <div>failed to get any routes</div>;
    }
  }
}
