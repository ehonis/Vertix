"use client";

import { useEffect } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import LeaderBoardSlide from "./leaderboard-slide";
import LogoSlide from "./logo-slide";
import StatsSlide from "../admin/tv/stats-slide";
import FeaturedRouteSlide from "../admin/tv/featured-route-slide";
import GymStatsSlide from "./gym-stats-slide";

type TVSlide = {
  id: string;
  type: string;
  imageUrl: string | null;
  text: string | null;
  isActive: boolean;
};

type MonthlyLeaderBoardData = {
  user: {
    name: string | null;
    id: string;
    totalXp: number;
    username: string | null;
    image: string | null;
  };
  xp: number;
}[];

export default function TVSlider({
  slides,
  monthlyLeaderBoardData,
  boulderGradeCounts,
  ropeGradeCounts,
  ropeTotal,
  boulderTotal,
}: {
  slides: TVSlide[];
  monthlyLeaderBoardData: MonthlyLeaderBoardData;
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
}) {
  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = "unset";
    };
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <p className="text-white text-2xl font-barlow">No slides available</p>
      </div>
    );
  }

  slides = slides.filter(
    slide =>
      slide.type == "STATS" ||
      slide.type === "LOGO" ||
      slide.type === "LEADERBOARD" ||
      slide.type === "FEATURED_ROUTE" ||
      slide.type === "IMAGE"
  );

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        spaceBetween={0}
        className="w-full h-full"
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id} className="flex items-center justify-center p-5">
            <div className="w-full h-full flex items-center justify-center">
              {slide.type === "LEADERBOARD" && (
                <LeaderBoardSlide monthlyLeaderBoardData={monthlyLeaderBoardData} />
              )}
              {slide.type === "IMAGE" && (
                <div className="flex items-center justify-center w-full h-full">
                  {slide.imageUrl && (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.text || "TV Slide"}
                      width={1920}
                      height={1080}
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>
              )}
              {slide.type === "TEXT" && (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-white text-4xl font-barlow">{slide.text}</p>
                </div>
              )}
              {slide.type === "LOGO" && <LogoSlide />}
              {slide.type === "STATS" && (
                <GymStatsSlide
                  boulderGradeCounts={boulderGradeCounts}
                  ropeGradeCounts={ropeGradeCounts}
                  ropeTotal={ropeTotal}
                  boulderTotal={boulderTotal}
                />
              )}
              {/* {slide.type === "FEATURED_ROUTE" && } */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
