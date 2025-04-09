"use client";

import { useEffect, useState, useCallback } from "react";
import { Route, User } from "@prisma/client";
import ElementLoadingAnimation from "../general/element-loading-animation";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import RouteTile from "./route-tile";
import { useDebounce } from "use-debounce"; // Import useDebounce

export default function SearchRoutes({
  searchText,
  onData,
  user,
}: {
  searchText: string;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    isCompleted: boolean
  ) => void;
  user: User;
}) {
  const [routes, setRoutes] = useState<(Route & { completed: boolean })[]>([]);
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
        userId: user.id,
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
  }, [debouncedSearchText, take]);

  // LoadMore function: fetch additional routes and append them.
  const loadMore = async () => {
    const currentCount = routes.length;
    setIsLoading(true);
    const queryData = new URLSearchParams({
      // Skip the number of routes already loaded.
      skip: currentCount.toString(),
      take: take.toString(), // load next "page" of routes
      text: debouncedSearchText,
    });
    try {
      const response = await fetch(`/api/routes/search-routes?${queryData}`);
      if (!response.ok) {
        console.error("Error fetching more routes");
        return;
      }
      const result = await response.json();
      // Instead of replacing routes, append the new routes.
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
                    color={route.color}
                    name={route.title}
                    grade={route.grade}
                    id={route.id}
                    isArchived={route.isArchive}
                    isSearched={true}
                    onData={onData}
                    isCompleted={route.completed}
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
