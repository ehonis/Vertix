import RouteTiles from '../ui/routes/routeTiles';
import { auth } from '@/auth';
import { getRouteCompletions } from '@/lib/routeCompletions';
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

export default async function RoutePage() {
  const session = await auth();
  const user = session?.user || null;

  const routes = await getRoutes();
  const boulderRoutes = routes.data.filter((route) => route.type === 'boulder');
  const ropeRoutes = routes.data.filter((route) => route.type === 'rope');

  let completions = {};

  if (user) {
    try {
      completions = await getRouteCompletions(user.id);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }

  return (
    <>
      <RouteTiles
        ropes={ropeRoutes}
        boulders={boulderRoutes}
        user={user}
        completions={completions}
      />
    </>
  );
}
