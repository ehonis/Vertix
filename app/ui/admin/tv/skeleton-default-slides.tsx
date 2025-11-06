"use client";

import { motion } from "framer-motion";

export default function SkeletonDefaultSlides() {
  return (
    <div className="flex gap-2 w-full items-center justify-start">
      <div className="flex flex-col gap-2">
        <motion.div
          className="rounded-md bg-gray-600 h-28 w-54 "
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <motion.div
          className="rounded-md bg-gray-600 w-full h-22"
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
            backgroundSize: "200% 100%",
          }}
        />
        <motion.div
          className="rounded-md bg-gray-600 w-full h-4"
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
}
