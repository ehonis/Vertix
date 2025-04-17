"use client";

import { User } from "@prisma/client";
import TopDown from "./topdown";
import { useState } from "react";
import WallRoutes from "./wall-routes";
import SearchRoutes from "./search-routes";
import { Locations } from "@prisma/client";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import RoutePopUp from "./route-pop-up";
import clsx from "clsx";
import TagRoutes from "./tag-routes";

export default function RoutesPage({ user }: { user: User | null | undefined }) {
  const tags = [
    "Dyno",
    "Static",
    "Crimpy",
    "Roof",
    "Chimney",
    "Arete",
    "Slab",
    "Steep",
    "Cave",
    "Pinchy",
    "Dihedral",
    "Compression",
    "Vert",
    "Pockets",
    "Dualtex",
    "Burly",
  ];
  const [wall, setWall] = useState<string | null>(null);
  const [isTopDownActive, setIsTopDownActive] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [isRoutePopUp, setIsRoutePopUp] = useState(false);
  const [routePopUpId, setRoutePopUpId] = useState<string>("");
  const [routePopUpName, setRoutePopUpName] = useState<string>("");
  const [routePopUpGrade, setRoutePopUpGrade] = useState<string>("");
  const [routePopUpColor, setRoutePopUpColor] = useState<string>("");
  const [routePopUpIsCompleted, setRoutePopUpIsCompleted] = useState<boolean>(false);

  const handleTopDownChange = (data: Locations | null) => {
    if (data === null) {
      setIsTopDownActive(false);
      setWall(data);
    } else {
      setIsTopDownActive(true);
      setWall(data);
    }
  };

  const searchInputVariants = {
    hidden: {
      width: 0,
      opacity: 0,
    },
    visible: {
      width: "100%",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0,
        ease: "easeIn",
      },
    },
  };
  const topDownVariants = {
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const handleSearchButton = () => {
    setWall(null);
    setIsSearch(!isSearch);
    setIsTopDownActive(false);
  };
  const handleRoutePopUp = (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    isCompleted: boolean
  ) => {
    setRoutePopUpId(routeId);
    setRoutePopUpName(name);
    setRoutePopUpGrade(grade);
    setRoutePopUpColor(color);
    setRoutePopUpIsCompleted(isCompleted);
    setIsRoutePopUp(true);
  };
  const handleRoutePopUpCancel = () => {
    setRoutePopUpId("");
    setRoutePopUpName("");
    setRoutePopUpGrade("");
    setRoutePopUpColor("");
    setRoutePopUpIsCompleted(false);
    setIsRoutePopUp(false);
  };
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
    console.log(selectedTags);
  };
  return (
    <div className="w-full  font-barlow text-white flex justify-center">
      {isRoutePopUp && (
        <AnimatePresence>
          <RoutePopUp
            onCancel={handleRoutePopUpCancel}
            id={routePopUpId}
            name={routePopUpName}
            grade={routePopUpGrade}
            user={user}
            color={routePopUpColor}
            isCompleted={routePopUpIsCompleted}
          />
        </AnimatePresence>
      )}
      <div className="flex flex-col w-xs md:w-md h-full items-center mt-6">
        {!isSearch && (
          <div className="flex gap-4 rounded-full w-xs md:md overflow-x-auto scrol p-2 scrollbar-hidden ">
            {tags.map(tag => (
              <button
                key={tag}
                className={clsx(
                  "  px-2 py-1 rounded-full font-normal text-center",
                  selectedTags.includes(tag)
                    ? " bg-green-500 "
                    : "bg-black/25 outline-white outline"
                )}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 w-full mb-3">
          <div className="flex gap-2 w-full justify-between items-center">
            {!isSearch && (
              <h1 className="font-barlow text-white font-bold text-3xl text-start place-self-start italic">
                Routes
              </h1>
            )}

            <AnimatePresence>
              {isSearch && (
                <motion.input
                  key="search-input"
                  type="text"
                  className="border-b border-white w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Search routes by name or grade"
                  variants={searchInputVariants}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                />
              )}
            </AnimatePresence>
            <button onClick={() => handleSearchButton()}>
              {isSearch ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
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
              )}
            </button>
          </div>
        </div>
        {isSearch && (
          <div>
            <SearchRoutes
              searchText={searchText}
              onData={handleRoutePopUp}
              user={user as User}
              tags={selectedTags}
            />
          </div>
        )}
        <AnimatePresence>
          {!isSearch && (
            <motion.div
              variants={topDownVariants}
              animate="visible"
              exit="exit"
              className="flex flex-col w-full  "
            >
              <div className="bg-slate-900 rounded p-5 pl-4 py-3 flex flex-col justify-center items-center outline outline-blue-600">
                <TopDown onData={handleTopDownChange} />
              </div>
              <p className="font-normal text-xs mt-1">
                Tap a wall on the map to see the routes there
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTopDownActive && (
            <motion.div variants={topDownVariants} animate="visible" exit="exit" className="mt-2">
              <WallRoutes
                wall={wall}
                user={user as User}
                onData={handleRoutePopUp}
                selectedTags={selectedTags}
              />
            </motion.div>
          )}
          {selectedTags.length > 0 && !isTopDownActive && (
            <motion.div variants={topDownVariants} animate="visible" exit="exit" className="mt-2">
              <TagRoutes
                user={user as User}
                selectedTags={selectedTags}
                onData={handleRoutePopUp}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
