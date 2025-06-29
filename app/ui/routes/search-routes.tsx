"use client";

import { useEffect, useState, useCallback } from "react";
import { CommunityGrade, RouteCompletion, RouteAttempt, User } from "@prisma/client";
import ElementLoadingAnimation from "../general/element-loading-animation";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import RouteTile from "./route-tile";
import { useDebounce } from "use-debounce"; // Import useDebounce
import { RouteWithExtraData } from "@/app/api/routes/get-wall-routes-non-archive/route";

export default function SearchRoutes({
  user,
  searchText,
  onData,
  refreshTrigger,
}: {
  searchText: string;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    completions: RouteCompletion[],
    attempts: RouteAttempt[],
    userGrade: string | null,
    communityGrade: string
  ) => void;
  user: User;
  refreshTrigger?: number;
}) {
  const [routes, setRoutes] = useState<RouteWithExtraData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [take] = useState<number>(10); // We'll use a constant "take" for each new page load

  // Debounce the searchText so we don't trigger API calls too often.
  const [debouncedSearchText] = useDebounce(searchText, 300);

  // Whenever the debounced search text changes, fetch the first page.
  useEffect(() => {
    // Reset the list when the search text changes.
    if (debouncedSearchText === "") {
      setRoutes([]);
      setHasMore(false);
      return;
    }

    const fetchRoutes = async () => {
      setIsLoading(true);
      const queryData = new URLSearchParams({
        // Start with skip = 0 for a fresh search.
        skip: "0",
        take: take.toString(),
        text: debouncedSearchText,
        // Only include userId if it exists
        ...(user?.id && { userId: user.id }),
      });
      try {
        const response = await fetch(`/api/routes/search-routes?${queryData}`);
        if (!response.ok) {
          console.error("Error fetching routes");
          return;
        }
        const result = await response.json();
        // Replace current routes with the new data.
        setRoutes(result.data);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [debouncedSearchText, take, user?.id, refreshTrigger]);

  // LoadMore function: fetch additional routes and append them.
  const loadMore = async () => {
    const currentCount = routes.length;
    setIsLoading(true);
    const queryData = new URLSearchParams({
      // Skip the number of routes already loaded.
      skip: currentCount.toString(),
      take: take.toString(), // load next "page" of routes
      text: debouncedSearchText,
      // Only include userId if it exists
      ...(user?.id && { userId: user.id }),
    });
    try {
      const response = await fetch(`/api/routes/search-routes?${queryData}`);
      if (!response.ok) {
        console.error("Error fetching routes");
        return;
      }
      const result = await response.json();
      // Append new routes to the existing list.
      setRoutes(prevRoutes => [...prevRoutes, ...result.data]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Show a loading spinner when initially loading the list */}
      {isLoading && routes.length === 0 ? (
        <div className="mt-8">
          <ElementLoadingAnimation size={16} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {routes.length > 0 &&
            routes.map((route, index) => (
              <AnimatePresence key={route.id}>
                <motion.div
                  key={route.id}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{
                    width: { duration: 0.4, ease: "easeOut", delay: index * 0.07 },
                    opacity: { duration: 0.4, ease: "easeOut", delay: index * 0.07 },
                  }}
                >
                  <RouteTile
                    user={user}
                    color={route.color}
                    name={route.title}
                    grade={route.grade}
                    id={route.id}
                    isArchived={route.isArchive}
                    isSearched={true}
                    onData={onData}
                    completions={route.completions}
                    attempts={route.attempts}
                    communityGrades={route.communityGrades}
                  />
                </motion.div>
              </AnimatePresence>
            ))}
          {hasMore && (
            <div className="flex justify-center">
              <button
                className="px-5 py-2 text-lg rounded bg-gray-400 m-5 text-white hover:bg-gray-500"
                onClick={loadMore}
              >
                Show More
              </button>
            </div>
          )}
          {/* Optionally, show a spinner when loading more but not during the first load */}
          {isLoading && routes.length > 0 && (
            <div className="mt-4">
              <ElementLoadingAnimation size={16} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
