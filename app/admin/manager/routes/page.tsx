import { redirect } from "next/navigation";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import RouteManagerShell from "@/app/ui/admin/route-manager/RouteManagerShell";

export default async function Page() {
  const session = await auth();
  const user = session?.user ?? null;

  if (user?.role !== "ADMIN" && user?.role !== "ROUTE_SETTER") {
    redirect("/signin");
  }

  return <RouteManagerShell />;
}
