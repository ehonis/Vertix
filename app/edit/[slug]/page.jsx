import IndividualRoutePageLoad from '@/app/ui/edit/routeEdit/individualpageload';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
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
