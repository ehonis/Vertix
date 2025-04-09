import { auth } from "@/auth";
import RoutesPage from "../ui/routes/routes-page";
import { User } from "@prisma/client";
import ConstructionBlur from "../ui/general/construction-blur";

// const getCurrentRoutes = unstable_cache(
//   async () =>
//     prisma.route.findMany({
//       where: { isArchive: false },
//     }),
//   ["all-routes"],
//   {
//     revalidate: 60,
//   }
// );

export default async function RoutePage() {
  const session = await auth();
  const user = session?.user || null;

  return (
    <>
      {/* <ConstructionBlur /> */}
      <RoutesPage user={user as User | null | undefined} />
    </>
  );
}
