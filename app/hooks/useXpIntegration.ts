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

  // Function to gain XP and update database
  const gainXpWithDatabase = async (xpData: {
    totalXp: number;
    baseXp: number;
    xpExtrapolated: { type: string; xp: number }[];
  }) => {
    try {
      // Update database
      const response = await fetch("/api/user/xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ xpGained: xpData.totalXp }),
      });

      if (response.ok) {
        // Show XP popup
        gainXp(xpData);
      } else {
        console.error("Failed to update XP in database");
      }
    } catch (error) {
      console.error("Error updating XP:", error);
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
