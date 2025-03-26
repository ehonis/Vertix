"use client";

import { useState } from "react";
import Link from "next/link";
import SignOut from "../general/sign-out-button";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function HamburgerMenu({ user, status }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const links = [
    { name: "Home", href: "/" },
    { name: "Routes", href: "/routes" },
    { name: "Comps", href: "/competitions" },
    { name: "Search", href: "/search" },
  ];

  const profileLinks = [
    {
      name: "Dashboard",
      url: `/profile/${user?.username}/dashboard`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      ),
      extraStyles: "",
    },
    {
      name: "Profile",
      url: `/profile/${user?.username}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      extraStyles: "",
    },
    {
      name: "Settings",
      url: `/profile/${user?.username}/settings`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      extraStyles: "",
    },
  ];
  if (user?.role === "ADMIN") {
    profileLinks.push({
      name: "Admin Center",
      url: `/admin`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
      ),
      extraStyles: "purple-button text-sm",
    });
  }
  return (
    <>
      <button
        onClick={handleClick}
        className="relative flex flex-col justify-center items-center w-8 h-8"
      >
        <div className="absolute w-7 h-3.5 flex flex-col justify-between">
          <div
            className={`w-full h-0.5 bg-white rounded-sm transform transition-all duration-300 ease-out ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <div
            className={`w-full h-0.5 bg-white rounded-sm transform transition-all duration-300 ease-out ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-full h-0.5 bg-white rounded-sm transform transition-all duration-300 ease-out ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="fixed top-0 left-0 -z-10 bg-black h-svh w-screen px-5 pb-5 flex flex-col justify-between">
          <div className="mt-24 flex flex-col gap-12 ">
            {links.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="flex flex-col gap-3"
              >
                <div className="flex">
                  <p
                    href={link.href}
                    onClick={closeMenu}
                    className="text-white font-tomorrow text-5xl"
                  >
                    {link.name}
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-14 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          {!user ? (
            <div className="w-full place-self-end bg-bg1 rounded-md h-20 flex p-3 items-center font-barlow font-bold text-white text-md justify-between">
              <p className="text-lg">Not Signed in</p>
              <div className="flex gap-4">
                <Link
                  className="blue-button rounded-xs px-5 py-3"
                  href={"/signin"}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  className="bg-purple-600/15 outline-purple-400 outline-1 rounded-xs px-5 py-3"
                  href={"/signin"}
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full place-self-end bg-bg1 rounded-md h-fit flex flex-col py-3 px-2 items-center font-tomorrow font-bold text-white text-md justify-between">
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.125, ease: "easeInOut" }}
                    className="overflow-hidden mb-3 p-1"
                  >
                    <div className="grid grid-cols-2 grid-rows-2 gap-3 font-barlow items-center">
                      {profileLinks.map(link => (
                        <Link
                          key={link.name}
                          href={link.url}
                          onClick={closeMenu}
                          className={`grid grid-cols-3 w-full blue-button rounded-sm p-2 font-semibold text-center ${link.extraStyles}`}
                        >
                          <span>{link.icon}</span>
                          <p className={`place-self-center w-full text-sm whitespace-nowrap`}>
                            {link.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="w-full flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  {user.image ? (
                    <Image
                      src={user.image}
                      height={100}
                      width={100}
                      className="rounded-full size-12  outline-2 outline-white"
                      alt="picture of you"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}

                  <div className="flex flex-col w-3/4">
                    <p className="font-barlow font-semibold text-lg  truncate">
                      @{user.username ? user.username : user.id}
                    </p>
                    <p className="font-barlow font-thin">{user.email}</p>
                  </div>
                </div>
                <div>
                  <SignOut />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
