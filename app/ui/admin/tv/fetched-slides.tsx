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
    <div className="flex gap-5 ">
      {fetchedSlides.length > 0 &&
        fetchedSlides.map(slide => (
          <div key={slide.id} className="h-32 w-56 flex-shrink-0">
            {slide.type === "LEADERBOARD" && <LeaderBoardSlide />}
            {slide.type === "IMAGE" && (
              <div className="flex items-center justify-center purple-button p-2 rounded-md h-full w-full">
                <Image
                  src={slide.imageUrl || ""}
                  alt={slide.text ? slide.text : "TV Slide"}
                  width={125}
                  height={125}
                  className="object-cover"
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
