"use client";

import { Locations } from "@prisma/client";
import TopDown from "../../routes/topdown";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Route } from "@prisma/client";
import { motion } from "framer-motion";
import clsx from "clsx";
import { formatDateMMDD } from "@/lib/date";
import { useNotification } from "@/app/contexts/NotificationContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmationPopUp from "../../general/confirmation-pop-up";

export default function RouteEditListByWall({ routes }: { routes: Route[] }) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Initialize selectedWall with the value from URL params or localStorage
  const [selectedWall, setSelectedWall] = useState<Locations | null>(getInitialWallSelection);
  const [isRouteEdit, setIsRouteEdit] = useState(false);
  const [isOrder, setIsOrder] = useState(false);
  const [isArchiveConfirmationRope, setIsArchiveConfirmationRope] = useState(false);
  const [isDeleteConfirmationRope, setIsDeleteConfirmationRope] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [currentRoutes, setCurrentRoutes] = useState<Route[]>([]);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  /**
   * Loading states for different operations:
   * - isOrderLoading: Controls the save button state during order updates
   * - isArchiveLoading: Controls the archive button state during archiving operations
   * - isDeleteLoading: Controls the delete button state during deletion operations
   * These states prevent multiple simultaneous operations and provide user feedback
   */

  /**
   * Update URL and localStorage when selectedWall changes
   * This effect ensures that:
   * 1. The URL reflects the current wall selection (for bookmarking/sharing)
   * 2. The selection is persisted in localStorage (for page refreshes)
   * 3. The browser history is updated without creating new entries
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedWall) {
        // Update URL with wall parameter for direct linking and bookmarking
        const url = new URL(window.location.href);
        url.searchParams.set("wall", selectedWall);
        window.history.replaceState({}, "", url.toString());

        // Store in localStorage for persistence across page refreshes
        localStorage.setItem("selectedWall", selectedWall);
      } else {
        // Remove wall parameter from URL when no wall is selected
        const url = new URL(window.location.href);
        url.searchParams.delete("wall");
        window.history.replaceState({}, "", url.toString());

        // Remove from localStorage when no wall is selected
        localStorage.removeItem("selectedWall");
      }
    }
  }, [selectedWall]);

  /**
   * Memoized callback to handle wall selection changes from the TopDown component
   * This prevents infinite re-renders by only recreating the function when routes change
   * The function updates both the selectedWall state and filters the current routes
   */
  const handleSelectedWall = useCallback(
    (data: Locations | null) => {
      setSelectedWall(data);
      if (data === null) {
        setCurrentRoutes([]);
      } else {
        setCurrentRoutes(
          routes
            .filter(route => route.location === data)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      }
    },
    [routes]
  ); // Only recreate when routes prop changes

  /**
   * Initialize currentRoutes when selectedWall is set from URL/localStorage
   * This effect ensures that when a wall is pre-selected (from URL or localStorage),
   * the routes for that wall are immediately loaded and displayed
   */
  useEffect(() => {
    if (selectedWall) {
      setCurrentRoutes(
        routes
          .filter(route => route.location === selectedWall)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    }
  }, [selectedWall, routes]);

  /**
   * Handle route selection for bulk operations (archive/delete)
   * Toggles the selection state of a route in the selectedRoutes array
   * This allows users to select multiple routes for batch operations
   *
   * @param route - The route to toggle selection for
   */
  const handleRouteSelect = (route: Route) => {
    if (selectedRoutes.some(r => r.id === route.id)) {
      setSelectedRoutes(prev => prev.filter(r => r.id !== route.id));
    } else {
      setSelectedRoutes(prev => [...prev, route]);
    }
  };

  /**
   * Move a route down in the order (increase its order value)
   * Swaps the order values between the current route and the route below it
   * This is used in the sorting mode to reorder routes visually
   *
   * @param route - The route to move down
   */
  const handleRouteSortDown = (route: Route) => {
    const id = route.id;
    const currentOrder = route.order ?? 0;

    const reorderedRoutes = currentRoutes.map(route => {
      if (route.id === id) {
        return { ...route, order: (route.order ?? 0) + 1 };
      }
      if (route.order === currentOrder + 1) {
        return { ...route, order: (route.order ?? 0) - 1 };
      }
      return route;
    });

    setCurrentRoutes(reorderedRoutes);
  };

  /**
   * Move a route up in the order (decrease its order value)
   * Swaps the order values between the current route and the route above it
   * This is used in the sorting mode to reorder routes visually
   *
   * @param route - The route to move up
   */
  const handleRouteSortUp = (route: Route) => {
    const id = route.id;
    const currentOrder = route.order ?? 0;

    const reorderedRoutes = currentRoutes.map(route => {
      if (route.id === id) {
        return { ...route, order: (route.order ?? 0) - 1 };
      }
      if (route.order === currentOrder - 1) {
        return { ...route, order: (route.order ?? 0) + 1 };
      }
      return route;
    });

    setCurrentRoutes(reorderedRoutes);
  };

  /**
   * Save the current order of routes to the database
   * This function is called when users finish sorting routes and click "Save"
   * It sends the current order state to the API to persist the changes
   */
  const handleOrderSave = async () => {
    setIsOrderLoading(true);
    try {
      const response = await fetch("/api/routes/edit/update-order", {
        method: "PATCH",
        body: JSON.stringify(currentRoutes),
      });
      if (response.ok) {
        showNotification({ message: "Order updated successfully", color: "green" });
        setIsOrder(false);
        router.refresh();
      } else {
        showNotification({ message: "Error updating order", color: "red" });
        setIsOrder(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating route order:", error);
    } finally {
      setIsOrderLoading(false);
    }
  };

  /**
   * Normalize order values to be sequential (0, 1, 2, 3...) after routes are removed
   * This ensures that the order field remains consistent and sequential
   * Similar to the approach used in new-route-popup.tsx
   *
   * @param routes - Array of routes to normalize
   * @returns Array of routes with normalized order values
   */
  const normalizeOrderValues = (routes: Route[]): Route[] => {
    return routes
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((route, index) => ({
        ...route,
        order: index,
      }));
  };

  /**
   * Reorder remaining routes after archive/delete operations
   * This ensures that the order field remains sequential and consistent
   * Only updates routes that need their order changed
   */
  const reorderRemainingRoutes = async () => {
    try {
      // Get all non-archived routes for the current wall
      const remainingRoutes = routes
        .filter(route => route.location === selectedWall && !route.isArchive)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // Normalize order values to be sequential
      const normalizedRoutes = normalizeOrderValues(remainingRoutes);

      // Update the order values in the database
      const response = await fetch("/api/routes/edit/update-order", {
        method: "PATCH",
        body: JSON.stringify(normalizedRoutes),
      });

      if (!response.ok) {
        console.error("Failed to reorder routes after archive/delete");
      }
    } catch (error) {
      console.error("Error reordering routes after archive/delete:", error);
    }
  };

  const handleArchive = async () => {
    setIsArchiveLoading(true);
    try {
      // Reorder remaining routes BEFORE archiving to prevent updating non-existent routes
      await reorderRemainingRoutes();

      const response = await fetch("/api/routes/edit/archive-route", {
        method: "PATCH",
        body: JSON.stringify({ routes: selectedRoutes }),
      });
      if (response.ok) {
        showNotification({ message: "Routes archived successfully", color: "green" });

        // Clear selected routes and refresh the display
        setSelectedRoutes([]);
        setCurrentRoutes(prev =>
          prev.filter(route => !selectedRoutes.some(selected => selected.id === route.id))
        );
      } else {
        showNotification({ message: "Error archiving routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error archiving routes", color: "red" });
    } finally {
      setIsArchiveConfirmationRope(false);
      setIsArchiveLoading(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      // Reorder remaining routes BEFORE deleting to prevent updating non-existent routes
      await reorderRemainingRoutes();

      const response = await fetch("/api/routes/edit/delete-route", {
        method: "DELETE",
        body: JSON.stringify({ routes: selectedRoutes }),
      });
      if (response.ok) {
        showNotification({ message: "Routes deleted successfully", color: "green" });

        // Clear selected routes and refresh the display
        setSelectedRoutes([]);
        setCurrentRoutes(prev =>
          prev.filter(route => !selectedRoutes.some(selected => selected.id === route.id))
        );
      } else {
        showNotification({ message: "Error deleting routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error deleting routes", color: "red" });
    } finally {
      setIsDeleteConfirmationRope(false);
      setIsRouteEdit(false);
      setIsDeleteLoading(false);
      router.refresh();
    }
  };

  const handleCancel = () => {
    setSelectedRoutes([]);
  };
  return (
    <div className="w-full flex flex-col items-center gap-1 place-self-center">
      {isDeleteConfirmationRope && (
        <ConfirmationPopUp
          message="Are you sure you want to delete these routes?"
          onConfirmation={handleDelete}
          onCancel={() => setIsDeleteConfirmationRope(false)}
          submessage="This action cannot be undone."
        />
      )}

      {isArchiveConfirmationRope && (
        <ConfirmationPopUp
          message="Are you sure you want to archive these routes?"
          onConfirmation={handleArchive}
          onCancel={() => setIsArchiveConfirmationRope(false)}
          submessage="This action can be undone."
        />
      )}
      <div>
        <p className="text-white font-barlow text-sm text-center">Select a wall</p>
        <div className="p-4 rounded-md bg-slate-900">
          <TopDown onData={handleSelectedWall} initialSelection={selectedWall} />
        </div>
      </div>

      {selectedWall !== null && (
        <div className="min-w-xs flex flex-col items-center gap-3 place-self-center">
          <div className="w-full flex justify-between gap-2 text-white mt-5">
            {!isRouteEdit && !isOrder && (
              <div className="flex justify-between gap-2 w-full">
                <button
                  className="bg-blue-500/25 outline-blue-500 outline p-2 px-3 text-sm font-semibold  rounded text-white"
                  onClick={() => setIsOrder(true)}
                >
                  Sort
                </button>
                <button
                  className="bg-white/25 outline-gray-400 outline p-2 px-3 text-sm font-semibold  rounded text-white"
                  onClick={() => setIsRouteEdit(true)}
                >
                  Edit
                </button>
              </div>
            )}
            {isRouteEdit && (
              <div className="flex justify-between gap-2 w-full">
                <button
                  className="px-1 py-1 bg-red-500 rounded-md flex items-center gap-1 font-barlow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsDeleteConfirmationRope(true)}
                  disabled={isArchiveLoading || isDeleteLoading}
                >
                  {isDeleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  )}
                  Delete
                </button>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-gray-500 rounded-md flex items-center gap-1 font-barlow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsArchiveConfirmationRope(true)}
                    disabled={isArchiveLoading || isDeleteLoading}
                  >
                    {isArchiveLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                        />
                      </svg>
                    )}
                    Archive
                  </button>{" "}
                  <button
                    className="bg-blue-500/25 outline-blue-500 outline rounded-full size-8 flex items-center justify-center"
                    onClick={() => setIsRouteEdit(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 stroke-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {isOrder && (
              <div className="flex justify-between items-center gap-2 w-full">
                <button
                  className="bg-blue-500/25 outline-blue-500 outline rounded-full size-8 flex items-center justify-center"
                  onClick={() => setIsOrder(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 stroke-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-white font-barlow font-bold">Sort L → R</p>
                <button
                  className="bg-green-500 p-2 px-3 text-sm font-semibold  rounded text-white"
                  onClick={handleOrderSave}
                >
                  {isOrderLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="bg-slate-900 rounded-md  p-3 flex flex-col gap-3 w-xs">
            <div className="flex flex-col gap-2 text-white font-barlow">
              {currentRoutes
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((rope, index) => (
                  <motion.div
                    key={rope.id}
                    className="flex items-center gap-2 w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isRouteEdit && (
                      <input
                        type="checkbox"
                        checked={selectedRoutes.some(r => r.id === rope.id)}
                        onChange={() => handleRouteSelect(rope)}
                        className="size-5"
                      />
                    )}
                    {isOrder && index !== 0 && (
                      <div>
                        {/* up arrow */}
                        <button
                          className="bg-gray-700 rounded size-8 flex items-center justify-center"
                          onClick={() => handleRouteSortUp(rope)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {!isRouteEdit && !isOrder && (
                      <Link
                        href={`/admin/manager/routes/${rope.id}`}
                        className={clsx(
                          "outline rounded-md p-2 w-full flex justify-between items-center",
                          rope.color === "green" && "bg-green-500/25 outline-green-500",
                          rope.color === "blue" && "bg-blue-500/25 outline-blue-500",
                          rope.color === "red" && "bg-red-500/25 outline-red-500",
                          rope.color === "yellow" && "bg-yellow-500/25 outline-yellow-500",
                          rope.color === "purple" && "bg-purple-500/25 outline-purple-500",
                          rope.color === "orange" && "bg-orange-500/25 outline-orange-500",
                          rope.color === "pink" && "bg-pink-500/25 outline-pink-500",
                          rope.color === "gray" && "bg-gray-500/25 outline-gray-500",
                          rope.color === "white" && "bg-white/25 outline-white",
                          rope.color === "black" && "bg-black/25 outline-white/25"
                        )}
                      >
                        <div>
                          <p className="text-base font-bold">{rope.title}</p>
                          <p className="text-xs">{rope.grade}</p>
                        </div>
                        <p>{formatDateMMDD(rope.setDate)}</p>
                      </Link>
                    )}
                    {(isOrder || isRouteEdit) && (
                      <div
                        className={clsx(
                          "outline rounded-md p-2 w-full flex justify-between items-center",
                          rope.color === "green" && "bg-green-500/25 outline-green-500",
                          rope.color === "blue" && "bg-blue-500/25 outline-blue-500",
                          rope.color === "red" && "bg-red-500/25 outline-red-500",
                          rope.color === "yellow" && "bg-yellow-500/25 outline-yellow-500",
                          rope.color === "purple" && "bg-purple-500/25 outline-purple-500",
                          rope.color === "orange" && "bg-orange-500/25 outline-orange-500",
                          rope.color === "pink" && "bg-pink-500/25 outline-pink-500",
                          rope.color === "gray" && "bg-gray-500/25 outline-gray-500",
                          rope.color === "white" && "bg-white/25 outline-white",
                          rope.color === "black" && "bg-black/25 outline-white/25"
                        )}
                      >
                        <div>
                          <p className="text-base font-bold truncate w-36">{rope.title}</p>
                          <p className="text-xs">{rope.grade}</p>
                        </div>
                        <p>{formatDateMMDD(rope.setDate)}</p>
                      </div>
                    )}

                    {isOrder && index !== currentRoutes.length - 1 && (
                      <div>
                        {/* down arrow */}
                        <button
                          className="bg-gray-700 rounded size-8 flex items-center justify-center"
                          onClick={() => handleRouteSortDown(rope)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
