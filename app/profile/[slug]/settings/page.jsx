import SignOut from '@/app/ui/sign-out-button';
import SettingsNavBar from '@/app/ui/profile/settings/settings-nav-bar';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/prisma';

export default async function Settings({ params }) {
  const session = await auth();
  const slug = (await params).slug;
  const user = await prisma.user.findUnique({
    where: {
      id: slug,
    },
  });

  if (user && user.id === session.user.id) {
    return (
      <div className="flex flex-col h-screen ml-5 p-5 gap-5">
        <div className="flex justify-between">
          <h1 className="text-white text-3xl font-bold">Settings</h1>
          <SignOut />
        </div>
        <SettingsNavBar userData={user} />
      </div>
    );
  } else {
    redirect('/signin');
  }
}
