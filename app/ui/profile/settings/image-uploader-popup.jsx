"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import CustomUploadDropzoneComponent from "@/utils/uploadthing";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ImageUploaderPopUp({ onCancel, userId }) {
  const { showNotification } = useNotification();

  const router = useRouter();

  const handleImageUpload = async url => {
    if (url) {
      const data = { newImage: url, userId: userId };

      try {
        const response = await fetch("/api/user/settings/imageUpload", {
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
      showNotification({ message: "could not find image on client" });
    }
  };
  const handleRemoveImage = async () => {
    const data = { userId: userId };
    try {
      const response = await fetch("/api/user/settings/removeImage", {
        method: "POST",
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
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
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

          <CustomUploadDropzoneComponent
            appearance={{
              button:
                "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed p-2 bg-red-500 bg-none after:bg-orange-400",
              container: "flex-col rounded-md border-cyan-300 bg-slate-800",
              allowedContent: "flex h-8 flex-col items-center justify-center px-2 text-white",
            }}
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
          <button
            className="bg-red-500 text-white p-2 rounded-md font-bold"
            onClick={handleRemoveImage}
          >
            Remove Image
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
