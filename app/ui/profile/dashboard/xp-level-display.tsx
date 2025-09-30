"use client";

import { User } from "@prisma/client";
import { getLevelForXp, getXpForLevel } from "@/lib/route";

interface XpLevelDisplayProps {
  user: User;
}

export default function XpLevelDisplay({ user }: XpLevelDisplayProps) {
  const currentXp = user?.totalXp || 0;
  const currentLevel = getLevelForXp(currentXp);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const currentLevelXp = getXpForLevel(currentLevel);
  const xpToNextLevel = nextLevelXp - currentXp;
  const progressPercent = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Get accent colors based on level (similar to XP level bar)
  const getLevelAccentColors = (level: number) => {
    if (level >= 50)
      return {
        border: "border-red-400/30",
        text: "text-red-400",
        progress: "from-red-500 to-red-400",
        glowColor: "rgba(248, 113, 113, 0.9)",
      }; // Legendary
    if (level >= 30)
      return {
        border: "border-yellow-400/30",
        text: "text-yellow-300",
        progress: "from-yellow-500 to-yellow-400",
        glowColor: "rgba(250, 204, 21, 0.9)",
      }; // Epic
    if (level >= 20)
      return {
        border: "border-orange-400/30",
        text: "text-orange-300",
        progress: "from-orange-500 to-orange-400",
        glowColor: "rgba(251, 146, 60, 0.9)",
      }; // Rare
    if (level >= 10)
      return {
        border: "border-green-400/30",
        text: "text-green-300",
        progress: "from-green-500 to-green-400",
        glowColor: "rgba(34, 197, 94, 0.9)",
      }; // Uncommon
    return {
      border: "border-blue-400/30",
      text: "text-blue-300",
      progress: "from-blue-500 to-blue-400",
      glowColor: "rgba(59, 130, 246, 0.9)",
    }; // Common
  };

  const accentColors = getLevelAccentColors(currentLevel);

  return (
    <div className="flex items-center bg-slate-900 rounded-lg p-4 w-full gap-3 -mt-2">
      <div className="flex ">
        <span
          className={`text-5xl font-extrabold font-barlow ${accentColors.text} rounded-full -mt-1`}
        >
          {currentLevel}
        </span>
      </div>

      {/* XP Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-300 font-barlow">
          <span>{currentXp} XP</span>
          <span>{xpToNextLevel} to next level</span>
        </div>

        <div className="relative w-full">
          {/* Background bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            {/* Progress bar with glow effect */}
            <div
              className={`h-full bg-gradient-to-r ${accentColors.progress} rounded-full relative transition-all duration-300`}
              style={{
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                boxShadow: `0 0 8px ${accentColors.glowColor}`,
              }}
            />
          </div>
        </div>

        {/* Level info */}
        <div className="flex justify-between text-xs text-gray-400 font-barlow">
          <span>Level {currentLevel}</span>
          <span>Level {currentLevel + 1}</span>
        </div>
      </div>
    </div>
  );
}
