import Image from "next/image";

import Link from "next/link";
import clsx from "clsx";

export default function RouteImage() {
  const baseDelay = 9 * 0.05 + 0.3;
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
    <div className="mt-5 flex flex-col gap-3  md:gap-5 md:mt-5 w-screen items-center md:justify-center">
      {content.map((content, index) => (
        <div
          key={index}
          className="relative  outline-1 w-[70%] h-24 md:h-36 md:w-[28%] lg:h-44 rounded-md overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-l from-black/100 to-transparent z-10 min-w-full" />

          <Image
            src={content.imageUrl}
            width={1000}
            height={1000}
            alt="picture of route page"
            className={clsx(
              "absolute left-1/2 top-1/2 w-[130%] h-auto transform -translate-x-1/2 -translate-y-1/2 scale-125 rotate-12",
              (index + 1) % 2 === 0 && "-rotate-12",
              index === 1 && "-translate-y-2/3 scale-110"
            )}
          />

          <Link
            href={content.pageUrl}
            className="absolute flex items-center gap-2 right-0 top-1/2 -translate-y-1/2 z-20  text-white font-barlow font-extrabold px-2 py-2 rounded-md "
          >
            <p className="text-2xl lg:text-2xl">{content.text}</p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-9 lg:size-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
              />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
}
