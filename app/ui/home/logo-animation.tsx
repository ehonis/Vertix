"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HomeLogoAnimation() {
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

  return (
    <div className="relative flex justify-center w-full text-white p-5">
      {/* Purple glow in top left */}
      {/* <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation={true}
        pagination={{ clickable: true }}
        className="h-80 rounded-md shadow-lg"
      >
        <SwiperSlide>
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <img
              src="/images/climb1.jpg"
              alt="Climbing Wall 1"
              className="object-cover w-full h-full"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <img
              src="/images/climb2.jpg"
              alt="Climbing Wall 2"
              className="object-cover w-full h-full"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <img
              src="/images/climb3.jpg"
              alt="Climbing Wall 3"
              className="object-cover w-full h-full"
            />
          </div>
        </SwiperSlide>
      </Swiper> */}
      <div className="relative flex flex-col justify-between lg:w-3xl md:w-2xl w-full h-[calc(100vh-14rem)] bg-black rounded-md z-10 overflow-hidden md:p-5 p-3">
        {/* Radial gradient with center at bottom right corner */}

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

        <div className="z-20 text-6xl md:text-8xl font-barlow font-extralight text-start flex flex-col gap-1">
          <p>A</p> <p>New</p> <p>Way</p> <p>To</p>
          <span className="text-primary">
            {displayText}
            <span className="animate-flash-fast">|</span>
          </span>
        </div>
      </div>
    </div>
  );
}
