import prisma from "@/prisma";
import { Route, TVSlideType } from "@prisma/client";
import Image from "next/image";
import Toggle from "./toggle";
import FeaturedRouteSlide from "./featured-route-slide";
export default async function CreatedSlides() {
  const createdSlides = await prisma.tVSlide.findMany({
    where: {
      type: {
        in: [TVSlideType.IMAGE, TVSlideType.TEXT],
      },
    },
    orderBy: {
      createdAt: "asc",
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
            <div className="md:h-24 md:w-48 h-12 w-24">
              {slide.type === TVSlideType.IMAGE && (
                <div className="flex items-center justify-center purple-button  rounded-md h-full w-full">
                  <Image
                    src={slide.imageUrl || ""}
                    alt={slide.text || "Slide"}
                    width={150}
                    height={150}
                    className="object-contain md:w-full md:h-full w-3/4 h-3/4"
                  />
                </div>
              )}
              {slide.type === TVSlideType.TEXT && <p className="text-white">{slide.text}</p>}
            </div>
            <p className=" md:text-2xl text-center text-xs font-bold text-white">{slide.text}</p>
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
