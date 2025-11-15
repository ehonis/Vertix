import { auth } from "@/auth";
import RoutesPage from "../ui/routes/routes-page";
import { User } from "@prisma/client";
import ConstructionBlur from "../ui/general/construction-blur";

export default async function RoutePage() {
  const session = await auth();
  const user = session?.user || null;

  return (
    <>
      {user?.role !== "ADMIN" && <ConstructionBlur />}
      <RoutesPage user={user as User | null | undefined} />
    </>
  );
}
