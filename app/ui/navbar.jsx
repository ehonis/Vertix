"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

export default function NavBar() {
  const [isNavbar, setIsNavbar] = useState(true);
  const navRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsNavbar(true); // Close the navbar if click is outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    setIsNavbar(!isNavbar);
  };

  const navClick = () => {
    setIsNavbar(true);
  };

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 top-16 z-10 bg-black transition-all duration-700 transform",
          isNavbar ? "opacity-0" : "opacity-25"
        )}
      ></div>

      <div
        ref={navRef}
        className={clsx(
          "z-50 fixed flex p-5 h-screen w-[30rem] bg-bg1 top-16 transition-all duration-700 transform",
          isNavbar ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0"
        )}
      >
        <Link href={"/edit"} className="flex z-[100]" onClick={navClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          <p className="text-white font-bold">Edit</p>
        </Link>
      </div>
      <nav className="h-16 w-full z-50 shadow bg-[#181a1c] flex justify-between px-5 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-8 cursor-pointer"
          onClick={handleClick}
          ref={buttonRef}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        <Link href={"/"}>
          <Image
            src={"/img/OTR-Logo.avif"}
            width={110}
            height={110}
            alt="picture of OTR logo"
          />
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </nav>
    </>
  );
}
