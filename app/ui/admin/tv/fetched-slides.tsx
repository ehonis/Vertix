import prisma from "@/prisma";
import Image from "next/image";
import LeaderBoardSlide from "./leaderboard-slide";
import LogoSlide from "./logo-slide";
import StatsSlide from "./stats-slide";
import FeaturedRouteSlide from "./featured-route-slide";
export default async function FetchedSlides() {
  const fetchedSlides = await prisma.tVSlide.findMany({
    where: { isActive: true },
  });

  return (
    <div className="flex md:gap-5 gap-2 ">
      {fetchedSlides.length > 0 &&
        fetchedSlides.map(slide => (
          <div key={slide.id} className="md:h-32 md:w-56 h-16 w-32 ">
            {slide.type === "LEADERBOARD" && <LeaderBoardSlide />}
            {slide.type === "IMAGE" && (
              <div className="flex items-center justify-center purple-button p-2 rounded-md h-full w-full">
                <Image
                  src={slide.imageUrl || ""}
                  alt={slide.text ? slide.text : "TV Slide"}
                  width={125}
                  height={125}
                  className="object-cover md:w-full md:h-full w-3/4 h-3/4"
                />
              </div>
            )}
            {slide.type === "TEXT" && <p>{slide.text}</p>}
            {slide.type === "LOGO" && <LogoSlide />}
            {slide.type === "STATS" && <StatsSlide />}
            {/* {slide.type === "FEATURED_ROUTE" && <FeaturedRouteSlide />} */}
          </div>
        ))}
    </div>
  );
}
