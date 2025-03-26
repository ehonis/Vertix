"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";

import "swiper/css";

export default function HomePageSwiper() {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const words = ["Climb", "Track", "Boulder", "Compete"];
    const currentWord = words[wordIndex];

    if (isDeleting) {
      if (charIndex > 0) {
        setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 100);
      } else {
        setIsDeleting(false);
        setWordIndex(prev => (prev + 1) % words.length); // Move to next word
      }
    } else {
      if (charIndex < currentWord.length) {
        setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 150);
      } else {
        setTimeout(() => setIsDeleting(true), 2500); // Pause before deleting
      }
    }
  }, [charIndex, isDeleting, wordIndex]);

  const content = [
    {
      text: "Routes",
      imageUrl: "/img/routes_ui_image.png",
      pageUrl: "/routes",
    },
    {
      text: "Comps",
      imageUrl: "/img/comp_image.jpeg",
      pageUrl: "/competitions",
    },
  ];
  return (
    <div className="relative flex justify-center w-full text-white p-5">
      <div className="relative flex flex-col justify-between lg:w-3xl md:w-2xl w-full md:gap-5 gap-3 bg-black rounded-md z-10 overflow-hidden md:p-5 p-5">
        {/* Radial gradient with center at bottom right corner */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          spaceBetween={30}
          pagination={{ clickable: true }}
          className="h-44 w-full rounded-md shadow-xl "
        >
          <SwiperSlide>
            <div className="flex flex-col items-center justify-center w-full h-full bg-black">
              <p className="font-tomorrow text-6xl font-bold italic">Vertix</p>
              <p className="font-barlow font-thin text-md ">
                All of your climbing data, in one place
              </p>
            </div>
          </SwiperSlide>
          {content.map((content, index) => (
            <SwiperSlide>
              <div key={index} className="relative  w-full h-full  overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-l from-black/100 to-transparent z-10 min-w-full" />

                <Image
                  src={content.imageUrl}
                  width={500}
                  height={500}
                  alt="picture of route page"
                  className={clsx(
                    "absolute left-1/2 top-1/2 w-[130%] h-auto transform -translate-x-1/2 -translate-y-1/2 scale-125 rotate-12",
                    (index + 1) % 2 === 0 && "-rotate-12",
                    index === 1 && "-translate-y-2/3 scale-110"
                  )}
                />

                <Link
                  href={content.pageUrl}
                  className="absolute flex items-center gap-2 right-0 top-1/2 -translate-y-1/2 z-30  text-white font-barlow font-extrabold px-2 py-2 rounded-md "
                >
                  <p className="text-3xl">{content.text}</p>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-12 lg:size-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                    />
                  </svg>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="z-20 text-5xl md:text-7xl font-barlow font-extralight text-start flex flex-col gap-1">
          <p>A</p> <p>New</p> <p>Way</p> <p>To</p>
          <span className="text-primary">
            {displayText}
            <span className="animate-flash-fast">|</span>
          </span>
        </div>

        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: "radial-gradient(circle at bottom right, #1d4ed8 0%, transparent 75%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: "radial-gradient(circle at top left, #6b21a8 0%, transparent 75%)",
          }}
        />
      </div>
    </div>
  );
}
