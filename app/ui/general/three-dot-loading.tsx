"use client";

import React from "react";
import { motion } from "framer-motion";

// ThreeDotLoading component displays three animated dots that bounce sequentially
export default function ThreeDotLoading() {
  return (
    // Container to center the dots horizontally and vertically
    <div className="flex items-center justify-center mt-5">
      {/* Map over an array of indices to render three dots */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          // Dot styling: size, color, shape, and spacing
          className="w-4 h-4 bg-gray-400 rounded-full mx-1"
          // Define the animation for vertical movement and opacity fading
          animate={{
            y: [0, -10, 0], // move up by 10px then back to 0
            opacity: [0.2, 1, 0.2], // fade in to full opacity then back to 0.2
          }}
          // Configure the transition for smooth looping and staggered start
          transition={{
            duration: 1.2, // slower bounce cycle (doubled duration)
            ease: "easeInOut", // easing function for smooth motion
            repeat: Infinity, // loop the animation forever
            delay: i * 0.4, // stagger each dot by 0.4s for slower effect
          }}
        />
      ))}
    </div>
  );
}
