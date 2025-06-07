import LandingComponent from "../ui/home/landing-component";
import Explainers from "../ui/home/explainers";
import LandingPageGraphs from "../ui/home/landing-page-graphs";
import { auth } from "@/auth";
export default async function Home() {
  const session = await auth();
  const user = session?.user || null;

  return (
    <div className="flex justify-center flex-col items-center">
      <LandingComponent user={user} />
      <Explainers />
      <LandingPageGraphs />
    </div>
  );
}
