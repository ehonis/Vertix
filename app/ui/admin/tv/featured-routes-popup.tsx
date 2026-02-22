"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { RouteImage } from "@/generated/prisma/browser";
import { useNotification } from "@/app/contexts/NotificationContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Route } from "@/generated/prisma/browser";
import ElementLoadingAnimation from "../../general/element-loading-animation";
import clsx from "clsx";
import ConfirmationPopUp from "../../general/confirmation-pop-up";

export type RouteWithExtraData = Route & {
  images: RouteImage[];
};
export function FeaturedRoutesPopup({
  routes,
  onCancel,
  slideId,
}: {
  routes: RouteWithExtraData[];
  onCancel: () => void;
  slideId: string;
}) {
  const router = useRouter();
  const [confirmationPopUp, setConfirmationPopUp] = useState(false);
  const [searchedRoutes, setSearchedRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { showNotification } = useNotification();
  const [tempRouteId, setTempRouteId] = useState<string | null>(null);
  const handleSearch = async (search: string) => {
    if (search.length < 3 || search === "") {
      return;
      setHasSearched(false);
    }
    setHasSearched(true);
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tv/routes?text=${search}&slideId=${slideId}`);
      const data = await response.json();

      setSearchedRoutes(data.routes || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (url: string, routeId: string) => {
    try {
      const response = await fetch(`/api/tv/routes`, {
        method: "POST",
        body: JSON.stringify({ functionName: "uploadImage", routeId, imageUrl: url, slideId }),
      });
      const data = await response.json();

      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification({
        message: "Error uploading image, please try again later",
        color: "red",
      });
    }
  };
  const handleAddRoute = async (routeId: string) => {
    try {
      const response = await fetch(`/api/tv/routes`, {
        method: "POST",
        body: JSON.stringify({ routeId, functionName: "addRoute", slideId }),
      });

      if (response.ok) {
        showNotification({
          message: "Route added successfully",
          color: "green",
        });
        router.refresh();
        setSearch("");
        setSearchedRoutes([]);
        setHasSearched(false);
      } else {
        showNotification({
          message: "Error adding route, please try again later",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error adding route:", error);
      showNotification({
        message: "Error adding route, please try again later",
        color: "red",
      });
    }
  };
  const handleRemoveRoute = async (routeId: string | null) => {
    if (!routeId) return;
    try {
      const response = await fetch(`/api/tv/routes`, {
        method: "POST",
        body: JSON.stringify({ functionName: "removeRoute", routeId, slideId }),
      });
      if (response.ok) {
        showNotification({
          message: "Route removed successfully",
          color: "green",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Error removing route:", error);
      showNotification({
        message: "Error removing route, please try again later",
        color: "red",
      });
    }
    setConfirmationPopUp(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-md"
    >
      {confirmationPopUp && (
        <ConfirmationPopUp
          onCancel={() => setConfirmationPopUp(false)}
          onConfirmation={() => handleRemoveRoute(tempRouteId)}
          message="Are you sure you want to remove this route?"
          submessage="This action cannot be undone."
        />
      )}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/35 outline p-2 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-4"
      >
        <button className="absolute top-2 right-2" onClick={onCancel}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 className="text-xl font-barlow font-bold">Featured Routes</h1>
        {routes.map(route => (
          <div
            key={route.id}
            className={clsx(
              "bg-slate-900/65 p-2 rounded-md flex justify-between items-center relative",
              route.color === "red" && "bg-red-500/25 outline outline-red-500",
              route.color === "blue" && "bg-blue-500/25 outline outline-blue-500",
              route.color === "green" && "bg-green-400/25 outline outline-green-400",
              route.color === "yellow" && "bg-yellow-500/25 outline outline-yellow-500",
              route.color === "purple" && "bg-purple-600/25 outline outline-purple-600",
              route.color === "white" && "bg-white/25 outline outline-white",
              route.color === "black" && "bg-black/25 outline outline-black",
              route.color === "pink" && "bg-pink-400/25 outline outline-pink-400",
              route.color === "orange" && "bg-orange-500/25 outline outline-orange-500"
            )}
          >
            {route.grade !== "vfeature" && route.grade !== "5.feature" && (
              <button
                className="absolute -top-3 -right-2 bg-red-500  p-2 rounded-full"
                onClick={() => {
                  setTempRouteId(route.id);
                  setConfirmationPopUp(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="flex flex-col gap-2">
              <p>{route.title}</p>
              <p>{route.setDate.toLocaleDateString()}</p>
              {route.grade === "vfeature" || route.grade === "5.feature" ? (
                <p className="text-green-400">+200XP</p>
              ) : (
                <p className="text-green-400">+ {route.bonusXp}XP</p>
              )}
            </div>
            {route.images?.length > 0 ? (
              <Image src={route.images[0].url} alt={route.title} width={100} height={100} />
            ) : (
              <UploadButton
                className="m-4 ut-button:bg-blue-400 ut-button:ut-readying:bg-red-500/50 ut-allowed-content:text-white "
                endpoint="imageUploader"
                onClientUploadComplete={res => {
                  handleImageUpload(res[0].ufsUrl, route.id);
                  showNotification({
                    message: "Image uploaded successfully",
                    color: "green",
                  });
                }}
                onUploadError={error => {
                  showNotification({
                    message: "Something went wrong, please try again later",
                    color: "red",
                  });
                  console.log(error);
                }}
              />
            )}
          </div>
        ))}
        <div className="h-px bg-gray-300"></div>
        <p className="text-sm text-gray-400">Search for routes to add to the featured routes</p>
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for Routes"
          className="blue-button p-2 px-3 rounded-full focus:outline-1"
        />
        {isLoading && <ElementLoadingAnimation size={7} />}
        {hasSearched &&
          (!isLoading && searchedRoutes.length > 0 ? (
            <div>
              {searchedRoutes.map(route => (
                <div
                  key={route.id}
                  className=" flex justify-between items-center bg-slate-900/65 p-3 rounded-md"
                >
                  <div className="flex flex-col gap-1 ">
                    <p>{route.title}</p>
                    <p>
                      {new Date(route.setDate).toLocaleDateString().split("/").reverse().join("-")}
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 green-button p-2 px-3 rounded-md"
                    onClick={() => handleAddRoute(route.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Add
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No routes found</p>
          ))}
      </motion.div>
    </motion.div>
  );
}
