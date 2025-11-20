import prisma from "@/prisma";
import { Route, TVSlideType } from "@prisma/client";
import LogoSlide from "./logo-slide";
import StatsSlide from "./stats-slide";
import LeaderBoardSlide from "./leaderboard-slide";
import FeaturedRouteSlide from "./featured-route-slide";
import Toggle from "./toggle";
export default async function FetchedDefaultSlides() {
  const fetchedDefaultSlides = await prisma.tVSlide.findMany({
    where: {
      type: {
        in: [TVSlideType.LOGO, TVSlideType.STATS, TVSlideType.LEADERBOARD],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const featuredRoute = fetchedDefaultSlides.find(
    slide => slide.type === TVSlideType.FEATURED_ROUTE
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      {fetchedDefaultSlides.length > 0 &&
        fetchedDefaultSlides.map(slide => (
          <div
            key={slide.id}
            className="flex items-center justify-between w-full bg-slate-800 p-3 rounded-md"
          >
            <div className="md:h-24 md:w-48 h-12 w-24">
              {slide.type === TVSlideType.LOGO && <LogoSlide />}

              {slide.type === TVSlideType.STATS && <StatsSlide />}
              {slide.type === TVSlideType.LEADERBOARD && <LeaderBoardSlide />}
            </div>
            <p className=" md:text-2xl text-sm font-bold text-white">{slide.text} Slide</p>
            <Toggle slideId={slide.id} isActive={slide.isActive} />
          </div>
        ))}
    </div>
  );
}
