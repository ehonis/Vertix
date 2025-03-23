"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";

export default function UserProfile({ user, status }) {
  const [isProfilePopUp, setIsProfilePopUp] = useState(false);

  const profileRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfilePopUp(false); // Close the navbar if click is outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    setIsProfilePopUp(!isProfilePopUp);
  };

  const menuItems = [
    {
      href: `/`,
      text: "Home",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      ),
    },
    {
      href: `/profile/${user?.username}`,
      text: "Profile",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      ),
    },
    {
      href: `/profile/${user?.username}/dashboard`,
      text: "Dashboard",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      ),
    },
    {
      href: `/profile/${user?.username}/settings`,
      text: "Settings",
      icon: (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </>
      ),
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            href: "/admin",
            text: "Admin Center",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            ),
          },
        ]
      : []),
  ];

  if (!user) {
    return (
      <Link href={"/signin"}>
        <span className="bg-purple-400/20  outline-purple-400 outline-1 p-2 rounded-sm text-white font-barlow font-bold text-sm md:text-base">
          Sign In
        </span>
      </Link>
    );
  } else {
    return (
      <div>
        {user.image ? (
          <Image
            src={user.image}
            alt="User Avatar"
            height={50}
            width={50}
            className="size-9 rounded-full"
            onClick={handleClick}
            ref={buttonRef}
          />
        ) : (
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
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}

        <div
          ref={profileRef}
          className={clsx(
            "z-50 fixed flex flex-col  h-max w-56  bg-black top-[5.2rem] justify-start transition-all p-3 duration-700 transform gap-3 right-0 button-container rounded-sm cursor-default",
            isProfilePopUp ? "opacity-100 -translate-x-2" : "opacity-0 translate-x-full"
          )}
        >
          <p className="text-white font-bold">
            Hello, <span>{user.name}</span>
          </p>

          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={clsx(
                "flex blue-button rounded-sm p-1 gap-2 group hover:bg-white transition-all duration-200",
                item.text === "Admin Center" && "purple-button"
              )}
              onClick={handleClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 stroke-white group-hover:stroke-black"
              >
                {item.icon}
              </svg>

              <p className="text-white font-bold group-hover:text-black">{item.text}</p>
            </Link>
          ))}

          <div className="flex justify-end"></div>
        </div>
      </div>
    );
  }
}
