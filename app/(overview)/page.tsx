import LandingComponent from "../ui/home/landing-component";
import Explainers from "../ui/home/explainers";
import Announcement from "../ui/home/announcement";
import SignUpPrompt from "../ui/home/signup-prompt";
export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center">
      <LandingComponent />
      <Explainers />
    </div>
  );
}
