"use client";

import { useState, useEffect } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Announcement from "./announcement";

import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";

import "swiper/css";
import { User } from "next-auth";

export default function LandingComponent({ user }: { user: User | null }) {
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
    <div className="relative flex flex-col md:grid md:grid-cols-2 md:flex-none justify-between items-center md:items-center w-full text-white p-5 md:pr-20 h-[calc(100svh)] md:h-lvh font-barlow -mt-[48px] md:-mt-[65px]">
      {/* Radial gradient with center at bottom right corner */}
      <div className="md:hidden mt-16 text-center">
        <Announcement />
      </div>
      <div className="z-20 text-6xl lg:text-8xl font-barlow font-light text-center flex flex-col gap-3 mt-8 md:mt-0 ">
        <div className="flex flex-col">
          <p>A new </p> <p>way to</p>
          <span className="text-primary font-semibold text-center mt-1">
            {displayText}
            <span className="animate-flash-fast">|</span>
          </span>
        </div>
        {!user ? (
          <div className="hidden md:flex gap-10 w-full justify-center mt-8">
            <Link
              href={"/signin"}
              className="blue-button p-2 px-3 text-3xl font-semibold z-20 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href={"/signin"}
              className="purple-button p-2 px-3 text-3xl font-semibold z-20 rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex gap-10 w-full justify-center mt-8">
            <Link
              href={"/routes"}
              className="blue-button p-2 px-3 text-3xl font-semibold z-20 rounded-lg"
            >
              Routes
            </Link>
            <Link
              href={`/profile/${user.username}/dashboard`}
              className="purple-button p-2 px-3 text-3xl font-semibold z-20 rounded-lg"
            >
              Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* <div
          className="absolute inset-0 opacity-50"
          style={{
            background: "radial-gradient(circle at bottom right, #1d4ed8 0%, transparent 75%)",
          }}
        /> */}
      {!user ? (
        <div className="flex gap-10 mt-5 md:hidden">
          <Link href={"/signin"} className="blue-button p-2 text-2xl font-semibold z-20">
            Sign In
          </Link>
          <Link href={"/signin"} className="purple-button p-2 text-2xl font-semibold z-20">
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="flex gap-10 mt-5 md:hidden">
          <Link href={"/routes"} className="blue-button p-2 text-2xl font-semibold z-20">
            Routes
          </Link>
          <Link
            href={`/profile/${user.username}/dashboard`}
            className="purple-button p-2 text-2xl font-semibold z-20"
          >
            Dashboard
          </Link>
        </div>
      )}
      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        spaceBetween={30}
        pagination={{ clickable: true }}
        className="h-60 md:h-96 w-[85%] rounded-lg shadow-xl z-20 "
      >
        <SwiperSlide>
          <div className="flex flex-col items-center justify-center w-full h-full bg-black">
            <p className="font-jost text-7xl font-bold">Vertix</p>
            <p className="font-barlow font-thin text-md ">
              All of your climbing data, in one place
            </p>
          </div>
        </SwiperSlide>
        {content.map((content, index) => (
          <SwiperSlide key={index}>
            <div className="relative  w-full h-full  overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-l from-black/100 to-transparent z-10 min-w-full" />

              <Image
                src={content.imageUrl}
                width={500}
                height={500}
                alt="picture of route page"
                className={clsx(
                  " w-full object-cover md:-translate-y-16",
                  index === 0 && "scale-150 rotate-12 translate-y-5"
                )}
                loading="lazy"
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
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(circle at bottom right, #1447E6 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
