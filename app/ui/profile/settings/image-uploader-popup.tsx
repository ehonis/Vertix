"use client";

import { motion } from "framer-motion";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/appUser";
import { useRef, useState } from "react";

type ImageUploaderPopUpData = {
  onCancel: () => void;
  user: AppUser;
};
export default function ImageUploaderPopUp({ onCancel, user }: ImageUploaderPopUpData) {
  const { showNotification } = useNotification();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File | null) => {
    if (!file) {
      showNotification({ message: "Please choose an image first", color: "red" });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/user/settings/imageUpload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        showNotification({
          message: "Error uploading image, try again later",
          color: "red",
        });
        return;
      }

      showNotification({
        message: "Successfully uploaded image",
        color: "green",
      });

      router.refresh();
      onCancel();
    } catch {
      showNotification({
        message: "Error uploading image, try again later",
        color: "red",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await fetch("/api/user/settings/removeImage", {
        method: "POST",
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0] ?? null;
              handleImageUpload(file);
            }}
          />

          <button
            type="button"
            className="m-4 rounded-md bg-blue-500/25 p-2 font-bold text-white outline outline-2 outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Choose image from device"}
          </button>

          {user.image && (
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
