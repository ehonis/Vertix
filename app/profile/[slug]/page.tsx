import prisma from "@/prisma";
import SendsPlate from "@/app/ui/profile/profile-page/sends-plate";
import ImageNamePlate from "@/app/ui/profile/profile-page/image-name-plate";
import { getRouteCompletions } from "@/lib/routeCompletions";
import { redirect } from "next/navigation";
import { Badge } from "@prisma/client";
// generate static pages
export async function generateStaticParams() {
  const usernames = await prisma.user
    .findMany()
    .then(users => users.map(user => ({ slug: user.username })));
  return usernames;
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const username = slug;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    redirect("/signin");
  }
  redirect(`/profile/${username}/dashboard`);

  return (
    <div className="w-screen">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
