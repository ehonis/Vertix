import { getUserById } from "@/lib/users";
import IndividualUserEdit from "@/app/ui/admin/user-edit/individual-user-edit";
import prisma from "@/prisma";
import Link from "next/link";
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
      <div className="px-6 pt-5">
        <Link href={"/admin/manager/users"} className="flex gap-1 items-center ">
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
          <p className="font-barlow font-bold text-xs text-white">Users Manager</p>
        </Link>
      </div>
      <IndividualUserEdit user={user} />
    </div>
  );
}
