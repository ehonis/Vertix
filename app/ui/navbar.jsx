import Link from 'next/link';
import Image from 'next/image';
import SideNav from './sideNav';
import UserProfile from './UserProfile';

import { SessionProvider } from 'next-auth/react';

export default async function NavBar() {
  return (
    <>
      <nav className="sticky h-16 top-0 w-full z-50 shadow bg-[#181a1c] flex px-5 justify-between  items-center">
        <SideNav />
        <Link href={'/'} className="flex items-center gap-2">
          <h1 className="font-tomorrow text-white md:text-4xl text-2xl font-bold italic">
            Vertix
          </h1>
        </Link>
        <button>
          <SessionProvider>
            <UserProfile />
          </SessionProvider>
        </button>
      </nav>
    </>
  );
}
