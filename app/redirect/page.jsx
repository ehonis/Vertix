import { redirect } from 'next/navigation';
import prisma from '@/prisma';
import { auth } from '@/auth';

export default async function RedirectPage({ params }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/');
  }
  if (user?.username === null) {
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { username: session.user.id },
      });
      redirect(`/profile/${session.user.id}/settings`);
    } catch (error) {
      console.error(error);
    }
  } else if (!user?.isOnboarded) {
    redirect(`/profile/${user.username}/settings`);
  } else {
    redirect(`/profile/${user.username}`);
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center font-barlow font-bold text-2xl text-white">
      <div>Redirecting...</div>
    </div>
  );
}
