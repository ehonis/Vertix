import Link from 'next/link';
import Image from 'next/image';
import SideNav from './sideNav';
import UserProfile from './UserProfile';
import { auth } from '@/auth';

export default async function NavBar() {
  const session = await auth();
  return (
    <>
      <nav className="h-16 w-full z-50 shadow bg-[#181a1c] flex px-5 justify-between  items-center">
        <SideNav />
        <Link href={'/'} className="flex items-center gap-2">
          <h1 className="font-jersey text-white text-3xl">ClimbTrak</h1>
          <div className="h-12 w-px bg-white"></div>
          <Image
            src={'/img/OTR-Logo.avif'}
            width={110}
            height={110}
            alt="picture of OTR logo"
          />
        </Link>
        <button>
          {session && session.user ? (
            <UserProfile user={session.user} />
          ) : (
            <UserProfile user={null} />
          )}
        </button>
      </nav>
    </>
  );
}
