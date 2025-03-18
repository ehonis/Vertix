import HomeLogoAnimation from '../ui/home/logo-animation';
import RouteImage from '../ui/home/route-image';
import Announcement from '../ui/home/announcement';
export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center gap-3">
      <HomeLogoAnimation />
      <div className="lg:w-3xl md:w-2xl w-xs h-1 bg-white rounded-full" />
      <Announcement />
      <RouteImage />
    </div>
  );
}
