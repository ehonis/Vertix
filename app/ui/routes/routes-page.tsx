"use client";

import { CommunityGrade, RouteAttempt, RouteCompletion, User } from "@prisma/client";
import TopDown from "./topdown";
import { useState, useEffect, useCallback } from "react";
import WallRoutes from "./wall-routes";
import SearchRoutes from "./search-routes";
import { Locations } from "@prisma/client";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import RoutePopUp from "./route-pop-up";
import clsx from "clsx";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { RouteCompletionProvider } from "@/app/contexts/routeCompletionContext";

export default function RoutesPage({ user }: { user: User | null | undefined }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Get initial wall selection from URL params or localStorage
   * This function determines which wall should be selected when the component loads
   * Priority: URL search params > localStorage > null (no selection)
   *
   * @returns The initially selected wall location or null if none is stored
   */
  const getInitialWallSelection = (): Locations | null => {
    // First try to get from URL search params - this allows direct linking to specific walls
    const wallParam = searchParams.get("wall");
    if (wallParam && Object.values(Locations).includes(wallParam as Locations)) {
      return wallParam as Locations;
    }

    // Fallback to localStorage if no URL param - this persists selection across page refreshes
    if (typeof window !== "undefined") {
      const storedWall = localStorage.getItem("selectedWall");
      if (storedWall && Object.values(Locations).includes(storedWall as Locations)) {
        return storedWall as Locations;
      }
    }

    return null;
  };

  const [wall, setWall] = useState<Locations | null>(getInitialWallSelection);
  const [isTopDownActive, setIsTopDownActive] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState<string>("");

  const [isRoutePopUp, setIsRoutePopUp] = useState(false);
  const [routePopUpId, setRoutePopUpId] = useState<string>("");
  const [routePopUpName, setRoutePopUpName] = useState<string>("");
  const [routePopUpGrade, setRoutePopUpGrade] = useState<string>("");
  const [routePopUpColor, setRoutePopUpColor] = useState<string>("");

  const [routePopUpCompletions, setRoutePopUpCompletions] = useState<number>(0);
  const [routePopUpAttempts, setRoutePopUpAttempts] = useState<number>(0);

  const [routePopUpUserGrade, setRoutePopUpUserGrade] = useState<string | null>(null);
  const [routePopUpCommunityGrade, setRoutePopUpCommunityGrade] = useState<string | null>(null);
  const [routePopUpXp, setRoutePopUpXp] = useState<{
    xp: number;
    baseXp: number;
    xpExtrapolated: { type: string; xp: number }[];
  } | null>(null);
  const [routePopUpIsArchived, setRoutePopUpIsArchived] = useState<boolean>(false);
  /**
   * Update URL and localStorage when wall selection changes
   * This effect ensures that:
   * 1. The URL reflects the current wall selection (for bookmarking/sharing)
   * 2. The selection is persisted in localStorage (for page refreshes)
   * 3. The browser history is updated without creating new entries
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (wall) {
        // Update URL with wall parameter for direct linking and bookmarking
        const url = new URL(window.location.href);
        url.searchParams.set("wall", wall);
        window.history.replaceState({}, "", url.toString());

        // Store in localStorage for persistence across page refreshes
        localStorage.setItem("selectedWall", wall);
      } else {
        // Remove wall parameter from URL when no wall is selected
        const url = new URL(window.location.href);
        url.searchParams.delete("wall");
        window.history.replaceState({}, "", url.toString());

        // Remove from localStorage when no wall is selected
        localStorage.removeItem("selectedWall");
      }
    }
  }, [wall]);

  /**
   * Memoized callback to handle wall selection changes from the TopDown component
   * This prevents infinite re-renders by only recreating the function when needed
   */
  const handleTopDownChange = useCallback((data: Locations | null) => {
    if (data === null) {
      setIsTopDownActive(false);
      setWall(data);
    } else {
      setIsTopDownActive(true);
      setWall(data);
    }
  }, []);

  // Initialize isTopDownActive when wall is set from URL/localStorage
  useEffect(() => {
    if (wall) {
      setIsTopDownActive(true);
    }
  }, [wall]);

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
    completions: RouteCompletion[],
    attempts: RouteAttempt[],
    userGrade: string | null,
    communityGrade: string | null,
    xp: { xp: number; baseXp: number; xpExtrapolated: { type: string; xp: number }[] } | null,
    isArchived: boolean
  ) => {
    setRoutePopUpId(routeId);
    setRoutePopUpName(name);
    setRoutePopUpGrade(grade);
    setRoutePopUpColor(color);
    setRoutePopUpCompletions(completions.length);
    setRoutePopUpAttempts(attempts[0]?.attempts || 0);
    setRoutePopUpCommunityGrade(communityGrade);
    setRoutePopUpUserGrade(userGrade);
    setRoutePopUpXp(xp);
    setRoutePopUpIsArchived(isArchived);
    setIsRoutePopUp(true);
  };
  const handleRoutePopUpCancel = () => {
    setRoutePopUpId("");
    setRoutePopUpName("");
    setRoutePopUpGrade("");
    setRoutePopUpColor("");
    setRoutePopUpCompletions(0);
    setRoutePopUpAttempts(0);
    setRoutePopUpCommunityGrade("");
    setRoutePopUpUserGrade(null);
    setRoutePopUpIsArchived(false);
    setIsRoutePopUp(false);
    // Trigger a refresh of the WallRoutes component data
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRouteCompleted = () => {
    // Trigger a refresh of the WallRoutes component data when a route is completed
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RouteCompletionProvider>
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
              completions={routePopUpCompletions}
              attempts={routePopUpAttempts}
              userGrade={routePopUpUserGrade}
              communityGrade={routePopUpCommunityGrade}
              onRouteCompleted={handleRouteCompleted}
              xp={routePopUpXp}
              isArchived={routePopUpIsArchived}
            />
          </AnimatePresence>
        )}
        <div className="flex flex-col w-xs md:w-md h-full items-center mt-6">
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
                refreshTrigger={refreshTrigger}
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
                  <TopDown onData={handleTopDownChange} initialSelection={wall} />
                </div>
                <p className="font-normal text-xs mt-1">
                  Tap a wall on the map to see the routes there
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isTopDownActive && (
              <motion.div variants={topDownVariants} animate="visible" exit="exit" className="mt-3">
                <h2 className="font-barlow text-white font-bold text-2xl text-start place-self-start mb-2">
                  Sorted Left → Right
                </h2>
                <WallRoutes
                  wall={wall}
                  user={user as User}
                  onData={handleRoutePopUp}
                  refreshTrigger={refreshTrigger}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RouteCompletionProvider>
  );
}
