"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXp, XpGain } from "@/app/contexts/XpContext";
import clsx from "clsx";

// Get accent colors based on level
const getLevelAccentColors = (level: number) => {
  if (level >= 50)
    return {
      border: "border-red-400/30",
      text: "text-red-400",
      progress: "from-red-500 to-red-400",
      xpGained: "text-green-400", // Always green
      glowColor: "rgba(248, 113, 113, 0.9)", // Red glow - more intense
      glowColor2: "rgba(239, 68, 68, 0.7)", // Secondary red glow
    }; // Legendary
  if (level >= 30)
    return {
      border: "border-yellow-400/30",
      text: "text-yellow-300",
      progress: "from-yellow-500 to-yellow-400",
      xpGained: "text-green-400", // Always green
      glowColor: "rgba(250, 204, 21, 0.9)", // Yellow glow - more intense
      glowColor2: "rgba(245, 158, 11, 0.7)", // Secondary yellow glow
    }; // Epic
  if (level >= 20)
    return {
      border: "border-orange-400/30",
      text: "text-orange-300",
      progress: "from-orange-500 to-orange-400",
      xpGained: "text-green-400", // Always green
      glowColor: "rgba(251, 146, 60, 0.9)", // Orange glow - more intense
      glowColor2: "rgba(249, 115, 22, 0.7)", // Secondary orange glow
    }; // Rare
  if (level >= 10)
    return {
      border: "border-green-400/30",
      text: "text-green-300",
      progress: "from-green-500 to-green-400",
      xpGained: "text-green-400", // Always green
      glowColor: "rgba(34, 197, 94, 0.9)", // Green glow - more intense
      glowColor2: "rgba(22, 163, 74, 0.7)", // Secondary green glow
    }; // Uncommon
  return {
    border: "border-blue-400/30",
    text: "text-blue-300",
    progress: "from-blue-500 to-blue-400",
    xpGained: "text-green-400", // Always green
    glowColor: "rgba(59, 130, 246, 0.9)", // Blue glow - more intense
    glowColor2: "rgba(37, 99, 235, 0.7)", // Secondary blue glow
  }; // Common
};

interface XpLevelBarProps {
  xpData: XpGain;
  onComplete?: () => void;
  isAnimatingOut?: boolean;
}

export default function XpLevelBar({
  xpData,
  onComplete,
  isAnimatingOut = false,
}: XpLevelBarProps) {
  const { getXpForLevel, isExpanded, setIsExpanded, restartAutoHide } = useXp();

  // Simple state management
  const [currentLevel, setCurrentLevel] = useState(xpData.currentLevel);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get accent colors based on the current level
  const accentColors = getLevelAccentColors(currentLevel);

  // Handle level up animation
  useEffect(() => {
    const isLevelUp = xpData.newLevel && xpData.newLevel > xpData.currentLevel;

    if (isLevelUp) {
      setIsAnimating(true);
      animateLevelUp(xpData.currentLevel, xpData.newLevel!);
    } else {
      // Normal state - calculate progress normally
      const currentLevelXp = getXpForLevel(xpData.currentLevel);
      const nextLevelXp = getXpForLevel(xpData.currentLevel + 1);
      const progress = ((xpData.currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
      setProgressPercent(Math.min(100, Math.max(0, progress)));
      setCurrentLevel(xpData.currentLevel);
    }
  }, [xpData.currentLevel, xpData.newLevel, xpData.currentXp, getXpForLevel]);

  // Animate level up with progress bar filling for each level
  const animateLevelUp = (fromLevel: number, toLevel: number) => {
    const steps = toLevel - fromLevel;
    const stepDuration = 400; // 400ms per level

    let currentStep = 0;

    const animateStep = () => {
      if (currentStep < steps) {
        const newLevel = fromLevel + currentStep + 1;
        setCurrentLevel(newLevel);

        // Reset progress bar to 0% and animate to 100%
        setProgressPercent(0);

        // Animate progress bar to 100% over 80% of step duration
        const progressDuration = stepDuration * 0.8;
        const startTime = Date.now();

        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, (elapsed / progressDuration) * 100);
          setProgressPercent(progress);

          if (progress < 100) {
            requestAnimationFrame(animateProgress);
          }
        };

        requestAnimationFrame(animateProgress);

        currentStep++;
        setTimeout(animateStep, stepDuration);
      } else {
        // Animation complete
        setIsAnimating(false);
        // Set final progress based on actual XP
        const currentLevelXp = getXpForLevel(toLevel);
        const nextLevelXp = getXpForLevel(toLevel + 1);
        const finalProgress =
          ((xpData.currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
        setProgressPercent(Math.min(100, Math.max(0, finalProgress)));
      }
    };

    animateStep();
  };

  // Calculate XP to next level
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const xpToNext = isAnimating
    ? nextLevelXp - currentLevelXp // During animation, show full level range
    : Math.max(0, nextLevelXp - xpData.currentXp); // Normal state, show actual remaining

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ y: -100, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{
          y: -100,
          opacity: 0,
          transition: {
            duration: 0.8,
            ease: "easeIn",
            delay: 0.2,
          },
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-90 w-11/12 max-w-sm"
      >
        <div
          className={`bg-slate-900/65 backdrop-blur-sm rounded-xl shadow-2xl border ${accentColors.border} relative cursor-pointer`}
          onClick={() => {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            // If collapsing, restart the auto-hide timer
            if (!newExpanded) {
              restartAutoHide();
            }
          }}
        >
          {/* Close button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onComplete?.();
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Compact View */}
          <div className="p-3">
            {/* Level, Progress bar, and XP gained */}
            <div className="flex items-center gap-3 mb-2">
              {/* Level counter on the left */}
              <div className="-mb-5">
                <div className="relative">
                  {/* Circle background */}
                  <div className="w-12 h-12 rounded-full bg-gray-900/80 border-2 border-gray-500 flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentLevel}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div
                            className={clsx(`text-2xl font-bold font-barlow relative`, {
                              "text-red-400": currentLevel >= 50,
                              "text-yellow-300": currentLevel >= 30 && currentLevel < 50,
                              "text-orange-300": currentLevel >= 20 && currentLevel < 30,
                              "text-green-300": currentLevel >= 10 && currentLevel < 20,
                              "text-blue-400": currentLevel < 10,
                            })}
                          >
                            {currentLevel}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar in the middle */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-end text-sm text-gray-300 font-barlow mb-1">
                  <span>{xpToNext} XP to next</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-visible relative">
                  {/* Glow effect behind the bar */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      width: `${progressPercent}%`,
                      boxShadow: `0 0 12px ${accentColors.glowColor}, 0 0 24px ${accentColors.glowColor2}, 0 0 36px ${accentColors.glowColor}`,
                      transition: isAnimating ? "none" : "all 0.3s ease-out",
                    }}
                  />

                  {/* Progress bar on top */}
                  <div
                    className={`h-full bg-gradient-to-r ${accentColors.progress} rounded-full relative z-10`}
                    style={{
                      width: `${progressPercent}%`,
                      transition: isAnimating ? "none" : "all 0.3s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* XP gained on the right */}
              <div className="flex-shrink-0 text-right -mb-5">
                <p className={`text-base font-bold ${accentColors.xpGained} font-barlow`}>
                  +{xpData.totalXp} XP
                </p>
              </div>
            </div>

            {/* Expand indicator */}
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-t border-gray-700"
              >
                <div className="p-3 pt-2">
                  {/* XP breakdown */}
                  {xpData.xpExtrapolated.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <p className="text-xs text-gray-400 font-barlow mb-2">XP Breakdown:</p>
                      {xpData.xpExtrapolated.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-300 font-barlow">{item.type}:</span>
                          <span
                            className={`font-barlow font-semibold ${
                              item.xp > 0 ? accentColors.xpGained : "text-red-400"
                            }`}
                          >
                            {item.xp > 0 ? "+" : ""}
                            {item.xp} XP
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Base XP */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 font-barlow mb-1">Base XP:</p>
                    <p className="text-sm text-gray-300 font-barlow">{xpData.baseXp} XP</p>
                  </div>

                  {/* Current stats */}
                  <div className="text-center text-xs text-gray-400 font-barlow">
                    Total: {xpData.currentXp} XP • Level: {xpData.currentLevel}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to use the level bar
export function useXpLevelBar() {
  const {
    showLevelBar,
    levelBarData,
    hideLevelBar,
    isExpanded,
    setIsExpanded,
    restartAutoHide,
    isAnimatingOut,
  } = useXp();

  return {
    showLevelBar,
    levelBarData,
    hideLevelBar,
    isExpanded,
    setIsExpanded,
    restartAutoHide,
    isAnimatingOut,
  };
}
