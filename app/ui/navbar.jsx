import Link from 'next/link';
import Image from 'next/image';
import SideNav from './sideNav';
import UserProfile from './UserProfile';

import { SessionProvider } from 'next-auth/react';

export default async function NavBar() {
  return (
    <>
      <nav className="fixed h-16 top-0 w-full z-50 shadow bg-[#181a1c] flex px-5 justify-between  items-center">
        <SideNav />
        <Link href={'/'} className="flex items-center gap-2">
          <h1 className="font-jersey text-white md:text-3xl text-xl">
            ClimbTrak
          </h1>
          <div className="h-12 w-px bg-white"></div>
          <Image
            src={'/img/OTR-Logo.avif'}
            width={110}
            height={110}
            style={{ objectFit: 'cover' }}
            alt="picture of OTR logo"
            className="w-20 h-9"
          />
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
