"use client";

import { motion } from "framer-motion";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/appUser";
import { useRef, useState } from "react";
import Image from "next/image";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[28px] border border-white/8 bg-slate-900/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <button
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
          onClick={onCancel}
          aria-label="Close image uploader"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-bg2 ring-2 ring-white/10">
            {user.image ? (
              <Image src={user.image} alt="Current profile picture" fill sizes="96px" className="object-cover" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-14 text-white/70"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Profile picture</h2>
            <p className="text-sm text-white/55">Upload a new image or remove your current one.</p>
          </div>
        </div>

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

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-2xl bg-white px-4 py-3 font-bold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Choose image from device"}
          </button>

          {user.image && (
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white transition hover:bg-white/8"
              onClick={handleRemoveImage}
            >
              Remove current image
            </button>
          )}

          <button
            type="button"
            className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-white/55 transition hover:text-white"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
