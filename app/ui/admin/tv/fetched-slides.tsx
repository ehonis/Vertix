import prisma from "@/prisma";
import Image from "next/image";
import LeaderBoardSlide from "./leaderboard-slide";
import LogoSlide from "./logo-slide";
import StatsSlide from "./stats-slide";
export default async function FetchedSlides() {
  const fetchedSlides = await prisma.tVSlide.findMany({
    where: { isActive: true },
  });

  return (
    <div className="flex gap-5 justify-center">
      {fetchedSlides.length > 0 &&
        fetchedSlides.map(slide => (
          <div key={slide.id} className="h-32 w-56 flex-shrink-0">
            {slide.type === "LEADERBOARD" && <LeaderBoardSlide />}
            {slide.type === "IMAGE" && (
              <Image
                src={slide.imageUrl || ""}
                alt={slide.text ? slide.text : "TV Slide"}
                width={100}
                height={100}
              />
            )}
            {slide.type === "TEXT" && <p>{slide.text}</p>}
            {slide.type === "LOGO" && <LogoSlide />}
            {slide.type === "STATS" && <StatsSlide />}
          </div>
        ))}
    </div>
  );
}
