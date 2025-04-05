"use client";

import { User } from "@prisma/client";
import TopDown from "./topdown";
import { useState, useEffect, Suspense } from "react";
import WallRoutes from "./wall-routes";
import ElementLoadingAnimation from "../general/element-loading-animation";

export default function RoutesPage({ user }: { user: User | null | undefined }) {
  const [wall, setWall] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const handleTopDownChange = (data: string) => {
    if (data === null) {
      setHasUserInteracted(false);
      setWall(data);
    } else {
      setHasUserInteracted(true);
      setWall(data);
    }
  };

  return (
    <div className="w-full  font-barlow text-white flex justify-center">
      <div className="flex flex-col w-xs md:w-md h-full items-center mt-10">
        <div className="flex flex-col gap-1 w-full mb-3">
          <div className="flex w-full justify-between items-center">
            <h1 className="font-barlow text-white font-bold text-3xl text-start place-self-start italic">
              Routes
            </h1>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>
          <div className="h-1 w-full rounded-full bg-white" />
        </div>
        <div className="flex flex-col w-full ">
          <div className="bg-slate-900 rounded-2xl p-5 pl-4 py-3 flex justify-center items-center">
            <TopDown onData={handleTopDownChange} />
          </div>
          <p className="font-normal text-md">Tap on a wall to see the routes there</p>
        </div>

        {hasUserInteracted && (
          <Suspense fallback={<ElementLoadingAnimation />}>
            <WallRoutes wall={wall} user={user as User} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
