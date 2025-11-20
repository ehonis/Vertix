"use client";

import { useEffect, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import LeaderBoardSlide from "./leaderboard-slide";
import LogoSlide from "./logo-slide";
import StatsSlide from "../admin/tv/stats-slide";
import FeaturedRouteSlide from "../admin/tv/featured-route-slide";
import GymStatsSlide from "./gym-stats-slide";
import FeaturedRoutes from "./featured-routes";
import { Route, RouteImage, TVSlide } from "@prisma/client";

type RouteWithImages = Route & {
  images: RouteImage[];
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

type TVData = {
  slides: extendedTVSlide[];
  monthlyLeaderBoardData: MonthlyLeaderBoardData;
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
};

type extendedTVSlide = TVSlide & {
  routes: RouteWithImages[];
};

export default function TVSlider({
  slides: initialSlides,
  monthlyLeaderBoardData: initialMonthlyLeaderBoardData,
  boulderGradeCounts: initialBoulderGradeCounts,
  ropeGradeCounts: initialRopeGradeCounts,
  ropeTotal: initialRopeTotal,
  boulderTotal: initialBoulderTotal,
}: {
  slides: extendedTVSlide[];
  monthlyLeaderBoardData: MonthlyLeaderBoardData;
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
}) {
  const [tvData, setTvData] = useState<TVData>({
    slides: initialSlides,
    monthlyLeaderBoardData: initialMonthlyLeaderBoardData,
    boulderGradeCounts: initialBoulderGradeCounts,
    ropeGradeCounts: initialRopeGradeCounts,
    ropeTotal: initialRopeTotal,
    boulderTotal: initialBoulderTotal,
  });

  // Poll for updates every 5 seconds
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch("/api/tv/data");
        if (response.ok) {
          const data = await response.json();
          setTvData(data);
        }
      } catch (error) {
        console.error("Failed to fetch TV updates:", error);
      }
    };

    // Fetch immediately, then every 2 minutes
    fetchUpdates();
    const interval = setInterval(fetchUpdates, 120000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = "unset";
    };
  }, []);

  const slides = tvData.slides.filter(
    slide =>
      // slide.type == "STATS" ||
      // slide.type === "LOGO" ||
      // slide.type === "LEADERBOARD" ||
      slide.type === "FEATURED_ROUTE"
    // slide.type === "IMAGE"
  );

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <p className="text-white text-2xl font-barlow">No slides available</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 10000, // 10 seconds
          disableOnInteraction: false,
        }}
        spaceBetween={0}
        className="w-full h-full"
        key={slides.map(s => s.id).join(",")} // Force re-render when slides change
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id} className="flex items-center justify-center p-5">
            <div className="w-full h-full flex items-center justify-center">
              {slide.type === "LEADERBOARD" && (
                <LeaderBoardSlide monthlyLeaderBoardData={tvData.monthlyLeaderBoardData} />
              )}
              {slide.type === "IMAGE" && (
                <div className="flex items-center justify-center w-full h-full  r">
                  {slide.imageUrl && (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.text || "TV Slide"}
                      width={1920}
                      height={1080}
                      className="object-contain w-full h-full rounded-2xl"
                    />
                  )}
                </div>
              )}
              {slide.type === "TEXT" && (
                <div className="flex items-center justify-center w-full h-full">
                  <p
                    className="text-white font-barlow"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 3rem)" }}
                  >
                    {slide.text}
                  </p>
                </div>
              )}
              {slide.type === "LOGO" && <LogoSlide />}
              {slide.type === "STATS" && (
                <GymStatsSlide
                  boulderGradeCounts={tvData.boulderGradeCounts}
                  ropeGradeCounts={tvData.ropeGradeCounts}
                  ropeTotal={tvData.ropeTotal}
                  boulderTotal={tvData.boulderTotal}
                />
              )}
              {slide.type === "FEATURED_ROUTE" && <FeaturedRoutes slide={slide} />}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
