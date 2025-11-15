import prisma from "@/prisma";
import { Route, TVSlideType } from "@prisma/client";
import Image from "next/image";
import Toggle from "./toggle";
import FeaturedRouteSlide from "./featured-route-slide";
export default async function CreatedSlides() {
  const createdSlides = await prisma.tVSlide.findMany({
    where: {
      type: {
        in: [TVSlideType.IMAGE, TVSlideType.TEXT, TVSlideType.FEATURED_ROUTE],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const activeRoutes = await prisma.route.findMany({
    where: {
      isArchive: false,
    },
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      {createdSlides.length > 0 ? (
        createdSlides.map(slide => (
          <div
            key={slide.id}
            className="flex items-center justify-between w-full bg-slate-800 p-3 rounded-md"
          >
            <div className="h-24 w-48">
              {slide.type === TVSlideType.IMAGE && (
                <div className="flex items-center justify-center purple-button p-2 rounded-md h-full w-full">
                  <Image
                    src={slide.imageUrl || ""}
                    alt={slide.text || "Slide"}
                    width={125}
                    height={125}
                    className="object-cover"
                  />
                </div>
              )}
              {slide.type === TVSlideType.TEXT && <p className="text-white">{slide.text}</p>}
              {slide.type === TVSlideType.FEATURED_ROUTE && (
                <FeaturedRouteSlide routes={activeRoutes} featuredRoute={null} />
              )}
            </div>
            <p className=" text-2xl font-bold text-white">{slide.text} Slide</p>
            <Toggle slideId={slide.id} isActive={slide.isActive} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-white text-2xl font-bold">No created slides found</p>
        </div>
      )}
    </div>
  );
}
