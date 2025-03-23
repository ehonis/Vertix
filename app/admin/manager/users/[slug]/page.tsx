import { getUserById } from "@/lib/users";
import IndividualUserEdit from "@/app/ui/admin/user-edit/individual-user-edit";
import prisma from "@/prisma";

// export async function generateStaticParams() {
//   const users = await prisma.user.findMany();
//   return users.map(user => ({
//     slug: user.id,
//   }));
// }

// type Props = {
//   params: {
//     slug: string;
//   };
// };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUserById(slug);

  if (!user) {
    return <div>User Not Found</div>;
  }

  return (
    <div>
      <IndividualUserEdit user={user} />
    </div>
  );
}
