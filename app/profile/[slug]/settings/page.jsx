import SignOut from '@/app/ui/sign-out-button';
import SettingsNavBar from '@/app/ui/profile/settings/settings-nav-bar';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

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
      <div className="flex flex-col w-screen h-screen p-5 gap-5">
        <h1 className="text-white text-3xl font-bold">Settings</h1>
        <SettingsNavBar userData={user} />
        <SignOut />
      </div>
    );
  } else {
    redirect('/signin');
  }
}
