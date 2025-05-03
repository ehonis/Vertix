"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";

export default function RouteImagePopup({
  routeId,
  onCancel,
}: {
  routeId: string;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchRoute = async () => {
      const response = await fetch(`/api/mixer/comp/get-route-image?routeId=${routeId}`);
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setIsLoading(false);
    };
    fetchRoute();
  }, [routeId]);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black z-30 blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Popup Container */}
      <motion.div
        className="fixed inset-0 z-50 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="relative  rounded-lg w-[90%] max-w-md h-min shadow-lg flex flex-col items-center justify-center">
          <button className="absolute top-0 right-0 p-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-10 stroke-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Route Image"
              width={1000}
              height={1000}
              className="rounded-lg object-contain"
            />
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <ElementLoadingAnimation size={16} />
            </div>
          )}
          {imageUrl === null && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-white">No image found</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
