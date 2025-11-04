"use client";

import { motion } from "framer-motion";

export default function SkeletonSlides() {
  return (
    <div className="flex gap-2 items-center justify-center">
      <motion.div
        className="rounded-md bg-gray-600 h-24 w-48 relative overflow-hidden"
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <motion.div
        className="rounded-md bg-gray-600 h-28 w-48 relative overflow-hidden"
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 0.2,
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <motion.div
        className="rounded-md bg-gray-600 h-36 w-52 relative overflow-hidden"
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 0.4,
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <motion.div
        className="rounded-md bg-gray-600 h-28 w-48 relative overflow-hidden"
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 0.6,
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <motion.div
        className="rounded-md bg-gray-600 h-24 w-48 relative overflow-hidden"
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 0.8,
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, #4b5563 0%, #9ca3af 50%, #4b5563 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
