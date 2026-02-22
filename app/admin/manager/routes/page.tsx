"use server";

import Link from "next/link";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";

import { UserRole } from "@/generated/prisma/client";
import NewRouteButton from "@/app/ui/admin/route-edit/new-route-button";
import RouteEditListByWall from "@/app/ui/admin/route-edit/route-edit-list-by-wall";

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
  const tags = await prisma.routeTag.findMany();

  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ROUTE_SETTER) {
    redirect("/signin");
  } else {
    return (
      <div className="w-full flex justify-center">
        <div className="md:w-md w-sm flex flex-col items-center justify-center">
          <div className="flex justify-between items-center md:w-md w-xs  sticky -bottom-24 mt-8 mb-5 z-10">
            <Link href={"/admin"} className="flex gap-1 items-center">
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
            <NewRouteButton tags={tags} />
          </div>

          <RouteEditListByWall routes={routes} />
        </div>
      </div>
    );
  }
}
