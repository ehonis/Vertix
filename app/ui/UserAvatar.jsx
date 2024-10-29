'use client';
import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

export default function UserAvatar({ userAvatar }) {
  const [isProfilePopUp, setIsProfilePopUp] = useState(false);

  const handleClick = () => {
    setIsProfilePopUp(!isProfilePopUp);
  };

  return (
    <div>
      <div onClick={handleClick}>
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt="User Avatar"
            height={50}
            width={50}
            className="size-9 rounded-full cursor-pointer"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-8 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </div>

      <div
        className={clsx(
          'z-50 fixed flex flex-col h-screen w-56 bg-white top-16 transition-all duration-700 transform gap-1 px-5',
          isProfilePopUp
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-full'
        )}
      >
        fe
      </div>
    </div>
  );
}
