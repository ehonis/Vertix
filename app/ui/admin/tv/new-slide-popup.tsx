"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { TVSlideType } from "@prisma/client";
import { useNotification } from "@/app/contexts/NotificationContext";
import SimpleToggle from "../../general/simple-toggle";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NewSlidePopup({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [type, setType] = useState<TVSlideType | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const { showNotification } = useNotification();
  const [validImage, setValidImage] = useState<boolean>(false);
  const [header, setHeader] = useState<string>("New Slide");
  const handleCreateSlide = async () => {
    const data = {
      type,
      imageUrl,
      text,
      isActive,
    };
    try {
      const response = await fetch("/api/tv/updateSlide", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create slide");
      }
      showNotification({
        message: "Slide created successfully",
        color: "green",
      });
      onCancel();
      router.refresh();
    } catch (error) {
      showNotification({
        message: "Failed to create slide",
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
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/35 outline p-2 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
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
          {type === null ? (
            <h1 className="text-xl font-barlow font-bold">{header}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setType(null);
                  setHeader("New Slide");
                }}
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
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-barlow font-bold">{header}</h1>
            </div>
          )}
          {type === null && (
            <div className="flex flex-col gap-2 justify-center w-full">
              <button
                className="bg-blue-500 text-white p-2 rounded-md font-bold"
                onClick={() => {
                  setType(TVSlideType.IMAGE);
                  setHeader("New Image Slide");
                }}
              >
                Promotional Image
              </button>
            </div>
          )}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Image"
              width={200}
              height={200}
              className="rounded-md place-self-center"
            />
          )}
          {type === TVSlideType.IMAGE && (
            <div className="flex flex-col gap-2 justify-center w-full">
              {!imageUrl ? (
                <UploadButton
                  className="m-4 ut-button:bg-blue-400 ut-button:ut-readying:bg-red-500/50 ut-allowed-content:text-white "
                  endpoint="imageUploader"
                  onClientUploadComplete={res => {
                    setImageUrl(res[0].ufsUrl);
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
              ) : (
                <button
                  className="bg-red-500 text-white p-2 rounded-md font-bold"
                  onClick={() => setImageUrl("")}
                >
                  Remove Image
                </button>
              )}
              <p className="text-center text-gray-400 italic  text-sm">
                Widescreen Image is preferred but vertical is also supported
              </p>

              <input
                type="text"
                placeholder="Title of the slide..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="outline outline-blue-500 rounded-sm px-2 "
              />

              <div className="flex justify-between items-center mt-2">
                <p className="text-white font-bold">Active</p>
                <SimpleToggle value={isActive} onValueChange={setIsActive} />
              </div>

              {imageUrl && text && (
                <button
                  className="green-button text-white font-bold p-2 rounded-md"
                  onClick={handleCreateSlide}
                >
                  Create Slide
                </button>
              )}
            </div>
          )}
          {type === TVSlideType.FEATURED_ROUTE && (
            <div className="flex flex-col gap-2 justify-center w-full">
              <p className="text-center text-gray-400 italic  text-sm">
                Take picture of the featured route
              </p>
              {!imageUrl ? (
                <UploadButton
                  className="m-4 ut-button:bg-blue-400 ut-button:ut-readying:bg-red-500/50 ut-allowed-content:text-white "
                  endpoint="imageUploader"
                  onClientUploadComplete={res => {
                    setImageUrl(res[0].ufsUrl);
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
              ) : (
                <button
                  className="bg-red-500 text-white p-2 rounded-md font-bold"
                  onClick={() => setImageUrl("")}
                >
                  Remove Image
                </button>
              )}
              <p className="text-center text-gray-400 italic  text-sm">
                Widescreen Image is preferred but vertical is also supported
              </p>

              <input
                type="text"
                placeholder="Title of the slide..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="outline outline-blue-500 rounded-sm px-2 "
              />

              <div className="flex justify-between items-center mt-2">
                <p className="text-white font-bold">Active</p>
                <SimpleToggle value={isActive} onValueChange={setIsActive} />
              </div>

              {imageUrl && text && (
                <button
                  className="green-button text-white font-bold p-2 rounded-md"
                  onClick={handleCreateSlide}
                >
                  Create Slide
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
