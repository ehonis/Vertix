import Link from "next/link";
import UserProfile from "./UserProfile";
import HamburgerMenu from "./hamburger";
import { auth } from "@/auth";
import { Suspense } from "react";

import ElementLoadingAnimation from "../general/element-loading-animation";
import { User } from "@prisma/client";

async function UserStuff() {
  const session = await auth();
  const user = session?.user || null;
  return (
    <div className="justify-self-end">
      <div className="self-center hidden md:block cursor-pointer">
        <UserProfile user={user as User} />
      </div>
      <div className="md:hidden">
        <HamburgerMenu user={user as User} />
      </div>
    </div>
  );
}

export default function NavBar() {
  return (
    <>
      <nav className="sticky top-3 h-12 md:h-16 w-[95%] md:w-[85%] lg:w-[75%] z-50 shadow-md bg-black grid md:px-5 px-3 md:grid-cols-3 grid-cols-2 items-center rounded-md mx-auto">
        <Link href={"/"} className="flex items-center gap-2 place-self-center justify-self-start">
          <h1 className="font-tomorrow text-white md:text-4xl text-3xl font-bold italic hover:scale-105 duration-100 ease-in-out">
            Vertix
          </h1>
        </Link>
        <div className=" font-tomorrow text-xl w-full text-gray-400 justify-center gap-5 hidden md:flex ml-2">
          <Link
            href={"/routes"}
            className="hover:text-white transition-all duration-100 hover:scale-105 ease-in-out"
          >
            Routes
          </Link>
          <Link
            href={"/competitions"}
            className="hover:text-white transition-all duration-100 hover:scale-105 ease-in-out"
          >
            Comps
          </Link>
          {/* <Link
            href={"/search"}
            className="hover:text-white transition-all duration-100 hover:scale-105 ease-in-out"
          >
            Search
          </Link> */}
        </div>
        <Suspense
          fallback={
            <div className="justify-self-end">
              <ElementLoadingAnimation size={4} />
            </div>
          }
        >
          <UserStuff />
        </Suspense>
      </nav>
    </>
  );
}
