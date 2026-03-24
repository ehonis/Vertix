import IndividualRoutePageLoad from "@/app/ui/admin/route-edit/individualpageload";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { redirect } from "next/navigation";

export const revalidate = 120;

export function generateStaticParams() {
  return [];
}

export default async function EditRoute({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await params;
  const routeId = slug;
  const user = session?.user ?? null;

  if (user?.role !== "ADMIN" && user?.role !== "ROUTE_SETTER") {
    redirect("/dashboard");
  }
  return (
    <div>
      <IndividualRoutePageLoad routeId={routeId} />
    </div>
  );
}
