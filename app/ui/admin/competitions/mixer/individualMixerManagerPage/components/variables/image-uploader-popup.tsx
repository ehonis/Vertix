"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ImageUploaderPopUp = {
  compId: string;
  onCancel: () => void;
  imageUrl: string | null;
};

export default function ImageUploaderPopUp({ compId, onCancel, imageUrl }: ImageUploaderPopUp) {
  const { showNotification } = useNotification();

  const [isImageUploader, setIsImageUploader] = useState(imageUrl ? false : true);

  const router = useRouter();

  const handleImageUpload = async (url: string) => {
    if (url) {
      const data = { newImage: url, compId };

      try {
        const response = await fetch("/api/mixer/manager/variables/imageUpload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          showNotification({ message: "Could not upload image", color: "red" });
        } else {
          showNotification({
            message: "Successfully Uploaded Image",
            color: "green",
          });

          router.refresh();
          onCancel();
        }
      } catch (error) {
        showNotification({ message: "Could not upload image", color: "red" });
      }
    } else {
      showNotification({ message: "could not find image on client", color: "red" });
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
          {isImageUploader ? (
            <UploadButton
              className="m-4 ut-button:bg-red-500 ut-button:ut-readying:bg-red-500/50 ut-allowed-content:text-white "
              endpoint="imageUploader"
              onClientUploadComplete={res => {
                handleImageUpload(res[0].ufsUrl);
              }}
              onUploadError={(error: Error) => {
                showNotification({
                  message: "Could not uploaded image",
                  color: "red",
                });
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-bg2 outline-2 rounded-full my-1 overflow-hidden size-32">
                {" "}
                <Image
                  src={imageUrl!}
                  width={200}
                  height={200}
                  className="size-full object-cover rounded-full"
                  alt="Comp Image"
                />
              </div>
              <div>
                <p className="text-center">This is the image you uploaded</p>
                <p className="text-xs font-thin italic text-center">
                  At this time, image cropping is not available. Please keep the image centered
                  before uploading
                </p>
              </div>
              <button
                className="bg-blue-500 rounded-md px-2 py-1 "
                onClick={() => setIsImageUploader(true)}
              >
                Upload New Image
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
