"use client";

import XpLevelBar, { useXpLevelBar } from "@/app/ui/general/xp-level-bar";

export default function XpLevelBarWrapper() {
  const { showLevelBar, levelBarData, hideLevelBar, isAnimatingOut } = useXpLevelBar();

  if (!showLevelBar || !levelBarData) {
    return null;
  }

  return (
    <XpLevelBar xpData={levelBarData} onComplete={hideLevelBar} isAnimatingOut={isAnimatingOut} />
  );
}
