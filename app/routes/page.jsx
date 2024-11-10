import Routes from '../ui/routes/routes';
import { auth } from '@/auth';
import { getRouteCompletions } from '@/lib/routeCompletions';
import prisma from '@/prisma';

export default async function RoutePage() {
  const session = await auth();
  const user = session?.user || null;
  const routes = await prisma.Route.findMany();
  const nonArchiveRoutes = routes.filter((route) => !route.isArchive);
  const boulderRoutes = nonArchiveRoutes.filter(
    (route) => route.type === 'boulder'
  );
  const ropeRoutes = nonArchiveRoutes.filter((route) => route.type === 'rope');

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
      <Routes
        ropes={ropeRoutes}
        boulders={boulderRoutes}
        user={user}
        completions={completions}
      />
    </>
  );
}
