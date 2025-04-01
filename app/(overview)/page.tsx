import LandingComponent from "../ui/home/landing-component";
import Explainers from "../ui/home/explainers";
import LandingPageGraphs from "../ui/home/landing-page-graphs";
export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center">
      <LandingComponent />
      <Explainers />
      <LandingPageGraphs />
    </div>
  );
}
