import HomePageSwiper from "../ui/home/home-page-swiper";
import Explainers from "../ui/home/explainers";
import Announcement from "../ui/home/announcement";
import SignUpPrompt from "../ui/home/signup-prompt";
export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center  mb-20 mt-5">
      <Announcement />
      <HomePageSwiper />
      <SignUpPrompt />
      <Explainers />
    </div>
  );
}
