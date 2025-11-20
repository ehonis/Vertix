import { Route, RouteImage, TVSlide } from "@prisma/client";
import Image from "next/image";
import LogoSlide from "../admin/tv/logo-slide";
import VertixLogo from "./vertix-logo";
import QRCodeSVG from "react-qr-code";
import clsx from "clsx";

type RouteWithImages = Route & {
  images: RouteImage[];
};

type extendedTVSlide = TVSlide & {
  routes: RouteWithImages[]; // Make routes optional
};

export default function FeaturedRoutes({ slide }: { slide: extendedTVSlide }) {
  // Safety check: ensure routes exists and is an array

  return (
    <div className="flex flex-col gap-20 font-barlow w-[90%]">
      <div className="flex items-center justify-between">
        <VertixLogo />
        <div className="flex items-center gap-2 ">
          <h1 className="text-white text-9xl font-bold -mb-16">Featured Routes</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-24 stroke-amber-300 fill-amber-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center ">
        <div className="flex items-center justify-center gap-24">
          {slide.routes?.map(route => (
            <div
              key={route.id}
              className={clsx(
                "flex flex-col p-10 rounded-3xl relative items-center gap-5 justify-between",
                "w-[650px] h-[1000px]", // Fixed dimensions for all cards
                {
                  "bg-green-400/25 outline-8 outline-green-400": route.color === "green",
                  "bg-red-400/25 outline-8 outline-red-400": route.color === "red",
                  "bg-blue-400/45 outline-8 outline-blue-400": route.color === "blue",
                  "bg-yellow-400/45 outline-8 outline-yellow-400": route.color === "yellow",
                  "bg-purple-600/45 outline-8 outline-purple-400": route.color === "purple",
                  "bg-orange-400/45 outline-8 outline-orange-400": route.color === "orange",
                  "bg-white": route.color === "white",
                  "bg-black/45 outline-8 outline-white": route.color === "black",
                  "bg-slate-400/45 outline-8 outline-white": route.color === "defaultColor",
                  "bg-pink-400/45 outline-8 outline-pink-400": route.color === "pink",
                }
              )}
            >
              <div className="absolute -top-12 -right-16 font-extrabold italic font-barlow text-green-400 font backdrop-blur-2xl outline outline-green-400 rounded-full px-8 py-4">
                {route.grade === "vfeature" || route.grade === "5.feature" ? (
                  <h4 className="text-green-400 text-6xl font-bold">+200 XP</h4>
                ) : (
                  <h4 className="text-green-400 text-6xl font-bold">+{route.bonusXp}XP</h4>
                )}
              </div>

              {/* Fixed size container for image */}
              <div className="w-full h-[700px] rounded-3xl overflow-hidden shrink-0">
                {route.images && route.images.length > 0 ? (
                  <Image
                    src={route.images[0].url}
                    alt={route.title}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <Image
                    src="https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJj9I5odjMwBODg1ThMEexA6Qt5k279NjYZiLzI"
                    alt="Default Route Image"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                )}
              </div>

              <div className="flex items-center justify-between w-full grow">
                <div>
                  <h2 className="text-white text-6xl font-bold">{route.title}</h2>
                  <h3 className="text-white text-5xl italic font-bold">{route.grade}</h3>
                </div>
                <div className="bg-white rounded-2xl p-3 w-min flex-shrink-0">
                  <QRCodeSVG
                    value={`https://vertixclimb.com/routes?route=${route.id}`}
                    size={175}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
