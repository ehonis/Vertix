import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma";
import Image from "next/image";
import Link from "next/link";
export default async function UserAdmin() {
  const session = await auth();
  const user = session?.user || null;

  if (!user || user?.admin === false) {
    redirect("/signin");
  }

  const users = await prisma.user.findMany({});

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
      <div className="flex flex-col gap-1  bg-bg0 rounded-md p-5 w-xs md:w-lg">
        {users.map(user => (
          <div className="flex w-full bg-black p-2 rounded-md" key={user.id}>
            <div className="flex gap-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`picture of ${user.name}`}
                  width={100}
                  height={100}
                  className="rounded-full object-cover size-14"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-14 stroke-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
              <div className="flex flex-col">
                <p className="text-lg font-bold">{user.name || "No name"}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
