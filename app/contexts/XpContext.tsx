"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export interface XpGain {
  totalXp: number;
  baseXp: number;
  xpExtrapolated: { type: string; xp: number }[];
  newLevel?: number;
  xpToNextLevel?: number;
  currentLevel: number;
  currentXp: number;
}

export interface XpGainInput {
  totalXp: number;
  baseXp: number;
  xpExtrapolated: { type: string; xp: number }[];
}

interface XpContextType {
  currentXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  monthlyXp: number;
  showLevelBar: boolean;
  levelBarData: XpGain | null;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isAnimatingOut: boolean;
  setIsAnimatingOut: (animating: boolean) => void;
  gainXp: (xpData: XpGainInput) => void;
  hideLevelBar: () => void;
  restartAutoHide: () => void;
  getLevelForXp: (xp: number) => number;
  getXpForLevel: (level: number) => number;
  getXpToNextLevel: (currentXp: number, currentLevel: number) => number;
  setUserXp: (xp: number, monthlyXp?: number) => void;
  isXpInitialized: boolean;
}

const XpContext = createContext<XpContextType | undefined>(undefined);

export function useXp() {
  const context = useContext(XpContext);
  if (context === undefined) {
    throw new Error("useXp must be used within an XpProvider");
  }
  return context;
}

interface XpProviderProps {
  children: ReactNode;
  initialXp?: number;
}

export function XpProvider({ children, initialXp = 0 }: XpProviderProps) {
  const [currentXp, setCurrentXp] = useState(initialXp);
  const [monthlyXp, setMonthlyXp] = useState(0);
  const [showLevelBar, setShowLevelBar] = useState(false);
  const [levelBarData, setLevelBarData] = useState<XpGain | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isExpanded, setIsExpandedState] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isXpInitialized, setIsXpInitialized] = useState(initialXp > 0);

  // Custom setIsExpanded that handles timeout logic
  const setIsExpanded = useCallback(
    (expanded: boolean) => {
      setIsExpandedState(expanded);

      if (expanded) {
        // Clear timeout when expanding - don't auto-hide when expanded
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
      } else {
        // Restart auto-hide when collapsing
        if (showLevelBar && levelBarData) {
          const hideDelay = 5000; // 5 seconds when collapsed
          const timeout = setTimeout(() => {
            setShowLevelBar(false);
            setHideTimeout(null);
          }, hideDelay);
          setHideTimeout(timeout);
        }
      }
    },
    [hideTimeout, showLevelBar, levelBarData]
  );

  const getLevelForXp = useCallback((xp: number): number => {
    if (xp < 0) return 0;
    const K = 10;
    return Math.floor(Math.sqrt(xp / K));
  }, []);

  const getXpForLevel = useCallback((level: number): number => {
    const K = 10;
    return Math.floor(K * level * level);
  }, []);

  const getXpToNextLevel = useCallback(
    (currentXp: number, currentLevel: number): number => {
      const nextLevelXp = getXpForLevel(currentLevel + 1);
      return Math.max(0, nextLevelXp - currentXp);
    },
    [getXpForLevel]
  );

  const gainXp = useCallback(
    (xpData: XpGainInput) => {
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }

      const oldLevel = getLevelForXp(currentXp);
      const newXp = currentXp + xpData.totalXp;
      const newLevel = getLevelForXp(newXp);
      const xpToNextLevel = getXpToNextLevel(newXp, newLevel);

      setCurrentXp(newXp);

      const levelBarData: XpGain = {
        ...xpData,
        currentLevel: oldLevel,
        currentXp: newXp,
        newLevel: newLevel > oldLevel ? newLevel : undefined,
        xpToNextLevel,
      };

      setLevelBarData(levelBarData);
      setShowLevelBar(true);

      // Auto-hide after longer delay for big gains and level ups
      const hideDelay = xpData.totalXp > 200 || newLevel > oldLevel ? 8000 : 5000;
      const timeout = setTimeout(() => {
        setShowLevelBar(false);
        setHideTimeout(null);
      }, hideDelay);

      setHideTimeout(timeout);
    },
    [currentXp, getLevelForXp, getXpToNextLevel, hideTimeout]
  );

  const hideLevelBar = useCallback(() => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    // Start exit animation
    setIsAnimatingOut(true);

    // Hide after animation completes
    setTimeout(() => {
      setShowLevelBar(false);
      setIsExpandedState(false);
      setIsAnimatingOut(false);
    }, 1000); // 1 second to allow exit animation to complete
  }, [hideTimeout]);

  const restartAutoHide = useCallback(() => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    // Restart auto-hide timer
    const hideDelay = 5000; // Default 5 seconds when collapsed
    const timeout = setTimeout(() => {
      setShowLevelBar(false);
      setHideTimeout(null);
    }, hideDelay);

    setHideTimeout(timeout);
  }, [hideTimeout]);

  const setUserXp = useCallback((xp: number, monthlyXp?: number) => {
    setCurrentXp(xp);
    if (monthlyXp !== undefined) {
      setMonthlyXp(monthlyXp);
    }
    setIsXpInitialized(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const currentLevel = getLevelForXp(currentXp);
  const xpToNextLevel = getXpToNextLevel(currentXp, currentLevel);

  const value: XpContextType = {
    currentXp,
    currentLevel,
    xpToNextLevel,
    monthlyXp,
    showLevelBar,
    levelBarData,
    isExpanded,
    setIsExpanded,
    isAnimatingOut,
    setIsAnimatingOut,
    gainXp,
    hideLevelBar,
    restartAutoHide,
    getLevelForXp,
    getXpForLevel,
    getXpToNextLevel,
    setUserXp,
    isXpInitialized,
  };

  return <XpContext.Provider value={value}>{children}</XpContext.Provider>;
}

// Hook to initialize XP from user data
export function useInitializeXp() {
  const { setUserXp, isXpInitialized } = useXp();
  const [isLoading, setIsLoading] = useState(false);

  const initializeXp = useCallback(
    async (userId: string) => {
      if (isXpInitialized || isLoading) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/user/xp", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserXp(data.xp || 0, data.monthlyXp || 0);
        }
      } catch (error) {
        console.error("Failed to initialize XP:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setUserXp, isXpInitialized, isLoading]
  );

  return { initializeXp, isLoading, isXpInitialized };
}
