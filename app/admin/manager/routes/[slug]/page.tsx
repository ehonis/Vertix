import IndividualRoutePageLoad from "@/app/ui/admin/route-edit/individualpageload";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma";
import { UserRole } from "@prisma/client";

export const revalidate = 120;

export function generateStaticParams() {
  const ids = prisma.route.findMany().then(routes => {
    return routes.map(route => ({ slug: route.id }));
  });
  return ids;
}

export default async function EditRoute({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await params;
  const routeId = slug;
  const user = session?.user || null;

  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.ROUTE_SETTER) {
    redirect("/dashboard");
  }
  return (
    <div>
      <IndividualRoutePageLoad routeId={routeId} />
    </div>
  );
}
