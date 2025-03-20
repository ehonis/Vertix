"use client";

import { useState, useEffect } from "react";

import SearchTextBox from "../ui/search/search-text-box";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import ConstructionBlur from "../ui/general/construction-blur";

export default function Search() {
  const [fetchedData, setFetchedData] = useState(null);
  return (
    <>
      <ConstructionBlur />
      <SearchTextBox onDataFetch={data => setFetchedData(data)} />
      {fetchedData ? (
        fetchedData.message === "profiles" ? (
          <>
            {/* profiles load */}
            <div className="flex w-full justify-center">
              <div className="flex gap-2 p-5 flex-wrap justify-center md:w-2/3">
                {fetchedData.data.map(profile => {
                  return (
                    <Link
                      key={profile.id}
                      href={`/profile/${profile.id}`}
                      className="flex flex-col gap-3 items-center justify-center bg-bg2 p-2 size-36 rounded-md"
                    >
                      <Image
                        src={
                          profile.image
                            ? profile.image
                            : "https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJjhC8qChmfsrL6AEIclW7bn0CeSKix1gBohFRZ"
                        }
                        width={75}
                        height={75}
                        className="rounded-full drop-shadow-customBlack"
                        alt={`picture of ${profile.name}`}
                      />
                      <p className="font-barlow font-bold text-white text-center">{profile.name}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-8 p-5 flex-col  justify-center items-center">
              {fetchedData.data.map(route => {
                return (
                  <Link
                    key={route.id}
                    href={`/route/${route.id}`}
                    className={clsx(
                      "flex gap-3 items-center w-full bg-bg2 size-36 md:w-1/2 rounded-md h-16 self-center",
                      {
                        "bg-green-400": route.color === "green",
                        "bg-red-400": route.color === "red",
                        "bg-blue-400": route.color === "blue",
                        "bg-yellow-400": route.color === "yellow",
                        "bg-purple-400": route.color === "purple",
                        "bg-orange-400": route.color === "orange",
                        "bg-white": route.color === "white",
                        "bg-slate-400": route.color === "defaultColor",
                        "bg-pink-400": route.color === "pink",
                      }
                    )}
                  >
                    <Image
                      src={
                        route.image
                          ? route.image
                          : "https://utfs.io/f/bujx12z5cHJjc9Ak3DLO1WJXeZH487yuvrhiVgUb5MoAPlpN"
                      }
                      width={75}
                      height={75}
                      className="rounded-full drop-shadow-customBlack size-20"
                      alt={`picture of ${route.title}`}
                    />
                    <div className="flex flex-col items-start">
                      <p className="font-barlow font-bold text-white text-center truncate drop-shadow-customBlack">
                        {route.title}
                      </p>
                      <p className="font-barlow font-bold text-white text-center truncate drop-shadow-customBlack">
                        {route.grade}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )
      ) : null}
    </>
  );
}
