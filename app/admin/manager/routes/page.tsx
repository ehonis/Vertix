import Link from "next/link";

import { redirect } from "next/navigation";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import NewRouteButton from "@/app/ui/admin/route-edit/new-route-button";
import RouteEditListByWall from "@/app/ui/admin/route-edit/route-edit-list-by-wall";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export const dynamic = "force-dynamic";

const getRoutes = async () => {
  const result = await createConvexServerClient().query(api.routes.searchRoutes, {
    text: "",
    take: 10000,
    skip: 0,
  });
  return result.data
    .filter(route => !route.isArchive)
    .map(route => ({
      id: route.id,
      title: route.title,
      grade: route.grade,
      color: route.color,
      setDate: new Date(route.setDate),
      type: route.type,
      location: route.location,
      x: route.x,
      y: route.y,
      order: route.order,
      isArchive: route.isArchive,
      xp: route.xp,
      bonusXp: route.bonusXp,
      createdByUserID: null,
    }));
};

export default async function Page() {
  const session = await auth();
  const user = session?.user ?? null;
  const routes = await getRoutes();

  if (user?.role !== "ADMIN" && user?.role !== "ROUTE_SETTER") {
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
            <NewRouteButton tags={[]} />
          </div>

          <RouteEditListByWall routes={routes} />
        </div>
      </div>
    );
  }
}
