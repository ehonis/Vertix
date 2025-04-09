import { motion } from "motion/react";
import { useState } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { User } from "@prisma/client";
import Link from "next/link";
import clsx from "clsx";

export default function RoutePopUp({
  id,
  grade,
  name,
  onCancel,
  user,
  color,
}: {
  id: string;
  grade: string;
  name: string;
  onCancel: () => void;
  user: User | null | undefined;
  color: string;
}) {
  const { showNotification } = useNotification();
  const router = useRouter();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-xs"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            " p-3 rounded-lg shadow-lg text-white max-w-[22rem] w-full relative flex flex-col gap-10 z-30 outline",
            {
              "bg-green-400/35  outline-green-400": color === "green",
              "bg-red-400/35  outline-red-400": color === "red",
              "bg-blue-400/35  outline-blue-400": color === "blue",
              "bg-yellow-400/35  outline-yellow-400": color === "yellow",
              "bg-purple-400/35  outline-purple-400": color === "purple",
              "bg-orange-400/35  outline-orange-400": color === "orange",
              "bg-white/35  outline-white-400": color === "white",
              "bg-slate-900/35  outline-white": color === "black",
              "bg-pink-400/35  outline-pink-400": color === "pink",
            }
          )}
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8 stroke-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex gap-2 items-center">
            <p className="text-2xl font-barlow font-bold max-w-2/3 truncate">{name}</p>
            <Link href={`/routes/${id}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7 stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </Link>
          </div>

          {!user ? (
            <div className="flex flex-col ">
              <p className="text-lg text-center">
                To complete or attempt this route you must be signed in
              </p>
              <Link
                href={"/signin"}
                className="p-2 bg-purple-600 rounded text-lg font-bold text-center"
              >
                Sign In!
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-col gap-2 justify-center items-center">
                <p className="font-barlow font-semibold text-lg">Quick Action</p>
                <div className="flex w-2/3 justify-between">
                  <button className="bg-gray-400 p-2 rounded shadow font-semibold font-barlow text-lg">
                    Attempt
                  </button>{" "}
                  <button className="bg-green-400 rounded p-2 shadow font-semibold font-barlow text-lg">
                    Complete
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <p className="font-semibold text-lg text-center">More Route Info</p>
            <Link href={`/routes/${id}`} className="p-2 bg-purple-600 rounded  text-center">
              Route Page
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
