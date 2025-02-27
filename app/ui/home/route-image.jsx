'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';
import clsx from 'clsx';

export default function RouteImage() {
  const baseDelay = 9 * 0.1 + 0.3;
  const content = [
    {
      text: 'Routes',
      imageUrl: '/img/routes_ui_image.png',
      pageUrl: '/routes',
    },
    {
      text: 'Comps',
      imageUrl: '/img/comp_image.jpeg',
      pageUrl: '/competitions',
    },
  ];
  return (
    <div className="mt-20 flex flex-col gap-3 md:flex-row md:gap-5 md:mt-28 w-screen items-center md:justify-center">
      {content.map((content, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: baseDelay + index * 0.3 + 1.1,
            duration: 0.3,
            ease: 'easeIn',
          }}
          className="relative  outline-1 w-80 h-36 md:w-1/3 md:h-48 rounded-md overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-black/100 to-transparent z-10 min-w-full" />

          <Image
            src={content.imageUrl}
            width={1000}
            height={1000}
            alt="picture of route page"
            className={clsx(
              'absolute left-1/2 top-1/2 w-[130%] h-auto transform -translate-x-1/2 -translate-y-1/2 scale-125 rotate-12',
              (index + 1) % 2 === 0 && '-rotate-12',
              index === 1 && '-translate-y-2/3 scale-110'
            )}
          />

          <Link
            href={content.pageUrl}
            className="absolute flex items-center gap-2 right-6 top-1/2 -translate-y-1/2 z-20 bg-blue-500 text-white font-barlow font-bold px-2 py-2 rounded-md outline"
          >
            <p className="md:text-3xl">{content.text}</p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 md:size-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
              />
            </svg>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
