import Link from 'next/link';
import Image from 'next/image';
import SideNav from './sideNav';
import UserAvatar from './UserAvatar';
import { auth } from '@/auth';

export default async function NavBar() {
  const session = await auth();
  return (
    <>
      <nav className="h-16 w-full z-50 shadow bg-[#181a1c] flex justify-between px-5 items-center">
        <SideNav />
        <Link href={'/'}>
          <Image
            src={'/img/OTR-Logo.avif'}
            width={110}
            height={110}
            alt="picture of OTR logo"
          />
        </Link>
        <button>
          {session && session.user ? (
            <UserAvatar userAvatar={session.user.image} />
          ) : (
            <UserAvatar userAvatar={null} />
          )}
        </button>
      </nav>
    </>
  );
}
