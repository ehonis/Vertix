import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import UserEditor from "@/app/ui/admin/user-edit/userEditor";
async function GetUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  });

  return <UserEditor users={users} />;
}

export default async function UserAdmin() {
  const session = await auth();
  const user = session?.user || null;

  if (!user || user?.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col w-full items-center font-barlow text-white">
      <div className="flex justify-start w-xs md:w-lg">
        <Link href={"/admin"} className="flex gap-1 items-center mb-2 mt-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <p className="font-barlow font-bold text-xs text-white">Admin Center</p>
        </Link>
      </div>
      <div className="w-xs md:w-lg flex justify-start mb-1">
        <h1 className="text-3xl font-bold">User Manager</h1>
      </div>
      <div className="h-1 rounded-full bg-white w-xs md:w-lg mb-2" />
      <Suspense
        fallback={
          <div className="flex justify-center">
            <ElementLoadingAnimation />
          </div>
        }
      >
        <GetUsers />
      </Suspense>
    </div>
  );
}
