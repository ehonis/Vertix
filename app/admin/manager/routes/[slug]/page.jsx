import IndividualRoutePageLoad from '@/app/ui/admin/route-edit/individualpageload';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/prisma';

export const revalidate = 120;

export function generateStaticParams() {
  const ids = prisma.route.findMany().then((routes) => {
    return routes.map((route) => ({ slug: route.id }));
  });
  return ids;
}

export default async function EditRoute({ params }) {
  const session = await auth();
  const routeId = params.slug;
  const user = session?.user || null;

  if (!user || user.admin === false) {
    redirect('/dashboard');
  }
  return (
    <div>
      <IndividualRoutePageLoad routeId={routeId} />
    </div>
  );
}
