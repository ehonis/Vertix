"use server";

import Link from "next/link";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";
import RouteListEdit from "@/app/ui/admin/route-edit/route-list-edit";

const getRoutes = async () => {
  const routes = await prisma.route.findMany({
    where: {
      isArchive: false,
    },
    orderBy: {
      setDate: "asc",
    },
  });
  return routes;
};

export default async function Page() {
  const session = await auth();
  const user = session?.user || null;
  const routes = await getRoutes();

  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  } else {
    const boulderRoutes = routes.filter(route => route.type === "BOULDER");
    const ropeRoutes = routes.filter(route => route.type === "ROPE");

    return (
      <div className="w-full flex justify-center">
        <div className="md:w-[75%] w-sm flex flex-col">
          <Link href={"/admin"} className="flex gap-1 items-center mt-5">
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
          <div className="flex justify-between items-center w-full pt-2 pb-5">
            <h1 className="text-white text-3xl font-bold">Route Manager</h1>
          </div>

          <RouteListEdit ropes={ropeRoutes} boulders={boulderRoutes} />
        </div>
      </div>
    );
  }
}
