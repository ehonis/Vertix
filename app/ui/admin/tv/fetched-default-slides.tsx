import LogoSlide from "./logo-slide";
import StatsSlide from "./stats-slide";
import LeaderBoardSlide from "./leaderboard-slide";
import FeaturedRouteSlide from "./featured-route-slide";
import Toggle from "./toggle";
import { FeaturedRoutesButton } from "./featured-routes-button";
import { findFeaturedRoutes, getTvData } from "@/lib/tv";

const TVSlideType = {
  LOGO: "LOGO",
  STATS: "STATS",
  LEADERBOARD: "LEADERBOARD",
  FEATURED_ROUTE: "FEATURED_ROUTE",
} as const;
export default async function FetchedDefaultSlides() {
  const tvData = await getTvData();
  const fetchedDefaultSlides = tvData.slides.filter(slide =>
    [
      TVSlideType.LOGO,
      TVSlideType.STATS,
      TVSlideType.LEADERBOARD,
      TVSlideType.FEATURED_ROUTE,
    ].includes(slide.type as (typeof TVSlideType)[keyof typeof TVSlideType])
  );
  const featuredRoutes = findFeaturedRoutes(tvData.slides);

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
