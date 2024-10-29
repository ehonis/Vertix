'use client';

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

export default function SideNav() {
  const [isNavbar, setIsNavbar] = useState(true);
  const [isProfile, setIsProfile] = useState(false);
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
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          'fixed inset-0 top-16 z-10 bg-black transition-opacity duration-700 transform',
          isNavbar ? 'invisible opacity-0' : 'visible opacity-25'
        )}
      ></div>
      <div className="flex flex-col fixed top-16 w-30 h-30 z-50 bg-bg1 "></div>
      <div
        ref={navRef}
        className={clsx(
          'z-50 fixed flex flex-col  h-screen w-56 bg-bg1 top-16 transition-all duration-700 transform gap-1 px-5',
          isNavbar ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'
        )}
      >
        <Link
          href={'/edit'}
          className={clsx(
            'flex z-[100] items-center group hover:bg-white  transition-all duration-700 rounded',
            isNavbar ? 'p-0' : 'p-5'
          )}
          onClick={navClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-10 group-hover:stroke-bg1 stroke-white transition-all duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          <p className="text-white font-bold ml-3 group-hover:text-bg1 transition-all duration-300 text-2xl">
            Edit
          </p>
        </Link>
        <Link
          href={'/routes'}
          className={clsx(
            'flex z-[100] items-center group hover:bg-white  transition-all duration-700 rounded',
            isNavbar ? 'p-0' : 'p-5'
          )}
          onClick={navClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-10 group-hover:stroke-bg1 stroke-white transition-all duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>

          <p className="text-white font-bold ml-3 group-hover:text-bg1 transition-all duration-300 text-2xl">
            Routes
          </p>
        </Link>
      </div>
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
    </>
  );
}
