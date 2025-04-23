import { auth } from "@/auth";
import NewWrapper from "@/app/ui/admin/new/new-wrapper";
import { redirect } from "next/navigation";
import prisma from "@/prisma";

export default async function Page() {
  const session = await auth();
  const user = session?.user || null;

  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }
  const tags = await prisma.routeTag.findMany();

  return <NewWrapper tags={tags} />;
}
