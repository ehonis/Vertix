"use client";

import { motion } from "framer-motion";

import clsx from "clsx";

type ElementLoadingAnimationProps = {
  size?: number;
};

export default function ElementLoadingAnimation({ size }: ElementLoadingAnimationProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={clsx(
        " border-4 border-gray-300 border-t-blue-500 rounded-full self-center place-self-center",
        size === undefined && "size-10",
        size === 5 && "size-5",
        size === 4 && "size-4",
        size === 6 && "size-6",
        size === 8 && "size-8",
        size === 7 && "size-7",
        size === 12 && "size-12 border-[6px]",
        size === 16 && "size-16 border-8"
      )}
    />
  );
}
