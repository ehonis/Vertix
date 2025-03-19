import HomeLogoAnimation from '../ui/home/logo-animation';
import RouteImage from '../ui/home/route-image';
import Announcement from '../ui/home/announcement';
export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center gap-1">
      <HomeLogoAnimation />

      <Announcement />
      <RouteImage />
    </div>
  );
}
