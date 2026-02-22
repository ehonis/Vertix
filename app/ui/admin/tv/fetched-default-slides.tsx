import prisma from "@/prisma";
import { TVSlideType } from "@/generated/prisma/client";
import LogoSlide from "./logo-slide";
import StatsSlide from "./stats-slide";
import LeaderBoardSlide from "./leaderboard-slide";
import FeaturedRouteSlide from "./featured-route-slide";
import Toggle from "./toggle";
import { FeaturedRoutesButton } from "./featured-routes-button";
export default async function FetchedDefaultSlides() {
  const fetchedDefaultSlides = await prisma.tVSlide.findMany({
    where: {
      type: {
        in: [
          TVSlideType.LOGO,
          TVSlideType.STATS,
          TVSlideType.LEADERBOARD,
          TVSlideType.FEATURED_ROUTE,
        ],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      routes: true,
    },
  });
  const featuredRoutes = await prisma.route.findMany({
    where: {
      isArchive: false,
      tvSlides: {
        some: {
          type: TVSlideType.FEATURED_ROUTE,
        },
      },
    },
    include: {
      tvSlides: true,
      images: true,
    },
  });

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
              {slide.type === TVSlideType.FEATURED_ROUTE && (
                <FeaturedRouteSlide routes={[]} featuredRoute={null} />
              )}
            </div>
            {slide.type !== TVSlideType.FEATURED_ROUTE ? (
              <div className="flex flex-col items-center gap-2 justify-between">
                <p className=" md:text-2xl text-sm font-bold text-white">{slide.text}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 justify-between">
                <FeaturedRoutesButton featuredRoutes={featuredRoutes} slide={slide} />
              </div>
            )}

            <Toggle slideId={slide.id} isActive={slide.isActive} />
          </div>
        ))}
    </div>
  );
}
