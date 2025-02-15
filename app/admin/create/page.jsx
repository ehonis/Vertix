import { auth } from '@/auth';
import NewWrapper from '@/app/ui/admin/new/new-wrapper';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  const user = session?.user || null;

  if (!user || !session?.user?.admin) {
    redirect('/signin');
  }

  return <NewWrapper />;
}
