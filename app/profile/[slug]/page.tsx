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
  const totalCompletionsInt = (await getRouteCompletions(username))?.length;
  return (
    <div className="w-screen">
      <div className="w-full flex flex-col items-center ">
        <ImageNamePlate
          image={user.image}
          name={user.name}
          username={username}
          title={user.tag}
          id={user.id}
        />
        <SendsPlate completions={totalCompletionsInt} highlightedBadge={undefined} />
      </div>
    </div>
  );
}
