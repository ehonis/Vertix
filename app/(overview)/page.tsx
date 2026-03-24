import LandingComponent from "../ui/home/landing-component";
import Explainers from "../ui/home/explainers";
import LandingPageGraphs from "../ui/home/landing-page-graphs";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { normalizeAppUser } from "@/lib/appUser";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const user = session?.user ?? null;

  if (user) {
    redirect("/routes");
  }

  return (
    <div className="flex justify-center flex-col items-center">
      <LandingComponent user={user} />
      <Explainers />
      <LandingPageGraphs />
    </div>
  );
}
