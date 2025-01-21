import prisma from '@/prisma';
import SendsPlate from '@/app/ui/profile/profile-page/sends-plate';
import ImageNamePlate from '@/app/ui/profile/profile-page/image-name-plate';
import { getRouteCompletions } from '@/lib/routeCompletions';
// generate static pages
export async function generateStaticParams() {
  const ids = await prisma.user
    .findMany()
    .then((users) => users.map((user) => ({ slug: user.id })));
  return ids;
}

export default async function ProfilePage({ params }) {
  const userId = params.slug;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const totalCompletionsInt = (await getRouteCompletions(userId)).length;
  return (
    <>
      <div>
        <ImageNamePlate
          image={user.image}
          name={user.name}
          id={userId}
          title={'Admin'}
        />
        <SendsPlate completions={totalCompletionsInt} highlightedBadge={null} />
      </div>
    </>
  );
}
