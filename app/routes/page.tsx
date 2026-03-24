import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import RoutesPage from "../ui/routes/routes-page";

export default async function RoutePage() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <>
      {/* {user?.role !== "ADMIN" && <ConstructionBlur />} */}
      <RoutesPage user={user} />
    </>
  );
}
