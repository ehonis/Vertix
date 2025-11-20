"use client";

import { TVSlide, TVSlideType } from "@prisma/client";
import { useState } from "react";
import { FeaturedRoutesPopup } from "./featured-routes-popup";
import { Route } from "@prisma/client";
import { RouteWithExtraData } from "./featured-routes-popup";
export function FeaturedRoutesButton({
  featuredRoutes,
  slide,
}: {
  featuredRoutes: RouteWithExtraData[];
  slide: TVSlide;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {isOpen && (
        <FeaturedRoutesPopup
          routes={featuredRoutes}
          onCancel={() => setIsOpen(false)}
          slideId={slide.id}
        />
      )}
      <button className="flex items-center gap-2 justify-between" onClick={() => setIsOpen(true)}>
        <div className="flex flex-col items-center gap-2 justify-between">
          <p className=" md:text-2xl text-sm font-bold text-white">{slide.text}</p>

          {featuredRoutes.map(route => (
            <p key={route.id} className="text-white text-xs">
              {route.title}
            </p>
          ))}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </button>
    </>
  );
}
