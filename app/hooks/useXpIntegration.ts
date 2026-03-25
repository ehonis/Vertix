"use client";

import React from "react";
import { useInitializeXp, useXp } from "@/app/contexts/XpContext";
import { calculateCompletionXpForRoute } from "@/lib/route-shared";

// Hook for easy XP integration in components
export function useXpIntegration(userId?: string) {
  const { initializeXp, isLoading, isXpInitialized } = useInitializeXp();
  const { gainXp, currentXp, currentLevel, monthlyXp } = useXp();

  // Initialize XP when user is available
  React.useEffect(() => {
    if (userId && !isXpInitialized && !isLoading) {
      initializeXp(userId);
    }
  }, [userId, isXpInitialized, isLoading, initializeXp]);

  // Route completion already persists XP in Convex. This hook only drives the client UX.
  const gainXpWithDatabase = async (xpData: {
    totalXp: number;
    baseXp: number;
    xpExtrapolated: { type: string; xp: number }[];
  }) => {
    try {
      gainXp(xpData);
    } catch (error) {
      console.error("Error showing XP gain:", error);
    }
  };

  // Helper function for route completion XP
  const gainRouteCompletionXp = async (routeData: {
    grade: string;
    previousCompletions: number;
    newHighestGrade: boolean;
    bonusXp?: number;
  }) => {
    const xpData = calculateCompletionXpForRoute(routeData);
    await gainXpWithDatabase({
      totalXp: xpData.xp,
      baseXp: xpData.baseXp,
      xpExtrapolated: xpData.xpExtrapolated,
    });
  };

  return {
    currentXp,
    currentLevel,
    monthlyXp,
    isXpInitialized,
    isLoading,
    gainXpWithDatabase,
    gainRouteCompletionXp,
  };
}
