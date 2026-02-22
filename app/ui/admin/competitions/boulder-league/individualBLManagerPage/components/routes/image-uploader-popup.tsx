"use client";

import { motion } from "framer-motion";
import { UploadButton } from "@/utils/uploadthing";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";

type ImageUploaderPopUpData = {
  onCancel: () => void;
  routeId: string;
  routeImageUrl: string | null;
};
export default function ImageUploaderPopUp({
  onCancel,
  routeId,
  routeImageUrl,
}: ImageUploaderPopUpData) {
  const { showNotification } = useNotification();

  const router = useRouter();

  const handleImageUpload = async (url: string) => {
    if (url) {
      const data = { newImage: url, routeId: routeId };

      try {
        const response = await fetch("/api/boulder-league/manager/route/routeImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          showNotification({
            message: "Error uploading image, try again later",
            color: "red",
          });
        } else {
          showNotification({
            message: "Successfully Uploaded Image",
            color: "green",
          });

          router.refresh();
          onCancel();
        }
      } catch (error) {
        showNotification({
          message: "Error uploading image, try again later",
          color: "red",
        });
      }
    } else {
      showNotification({ message: "could not find image on client", color: "red" });
    }
  };
  const handleRemoveImage = async () => {
    const data = { routeId: routeId };
    try {
      const response = await fetch("/api/boulder-league/manager/route/routeImage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "Error removing image, try again later",
          color: "red",
        });
      } else {
        showNotification({
          message: "Image removed successfully",
          color: "green",
        });
        router.refresh();
        onCancel();
      }
    } catch (error) {
      showNotification({
        message: "Error removing image, try again later",
        color: "red",
      });
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-30 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
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
          <h2 className="text-xl">Upload Image</h2>

          <UploadButton
            className="m-4 ut-button:bg-blue-500/25 ut-button:outline-2 ut-button:outline-blue-500 ut-button:ut-readying:bg-blue-500-500/50 ut-allowed-content:text-white "
            endpoint="imageUploader"
            onClientUploadComplete={res => {
              handleImageUpload(res[0].ufsUrl);
            }}
            onUploadError={error => {
              console.log(error);
              showNotification({
                message: "Could not uploaded image",
                color: "red",
              });
            }}
          />
          {routeImageUrl && (
            <button
              className="bg-red-500 text-white p-1 rounded-md font-bold"
              onClick={handleRemoveImage}
            >
              Remove Current Image
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
