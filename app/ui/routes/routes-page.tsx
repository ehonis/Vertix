"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RouteCompletionProvider } from "@/app/contexts/routeCompletionContext";
import RoutesDotMapShell from "./routes-dot-map-shell";
import RouteSlidePanel, { type RoutePanelData } from "./route-slide-panel";
import SearchRoutes from "./search-routes";
import type { AppUser } from "@/lib/appUser";
import type { AppRouteAttempt, AppRouteCompletion } from "@/lib/appTypes";
import RoutePopUp from "./route-pop-up";
import { projectOntoPolyline } from "@/lib/sortByPath";

export default function RoutesPage({ user }: { user: AppUser | null | undefined }) {
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch route dots for panel data lookup
  const routeDots = useQuery(api.routes.getRoutesPageDots, {});

  // Fetch wall sort paths for neighbor ordering
  const sortPathsRaw = useQuery(api.wallSortPaths.listAllWithPartKey, {});
  const sortPathsByPartKey = useMemo(() => {
    if (!sortPathsRaw) return new Map<string, Array<{ x: number; y: number }>>();
    const map = new Map<string, Array<{ x: number; y: number }>>();
    for (const sp of sortPathsRaw) {
      map.set(sp.partKey, sp.points);
    }
    return map;
  }, [sortPathsRaw]);

  // Build panel data for the selected route
  const selectedRoute: RoutePanelData | null = useMemo(() => {
    if (!selectedDotId || !routeDots) return null;
    const dot = routeDots.find(r => r.id === selectedDotId);
    if (!dot) return null;
    return {
      id: dot.id,
      convexId: dot.convexId,
      title: dot.title,
      grade: dot.grade,
      color: dot.color,
      type: dot.type,
      xp: dot.xp,
      bonusXp: dot.bonusXp,
      wallPart: dot.wallPart,
      completionCount: dot.completionCount,
      attemptCount: dot.attemptCount,
      isArchived: dot.isArchived,
    };
  }, [selectedDotId, routeDots]);

  // Compute prev/next neighbors on the same wall, sorted by sort path or x/y
  const { prevDotId, nextDotId } = useMemo(() => {
    if (!selectedDotId || !routeDots) return { prevDotId: null, nextDotId: null };
    const selected = routeDots.find(r => r.id === selectedDotId);
    if (!selected || !selected.wallPart) return { prevDotId: null, nextDotId: null };

    // Get all routes on the same wall
    const wallRoutes = routeDots.filter(r => r.wallPart === selected.wallPart);
    if (wallRoutes.length <= 1) return { prevDotId: null, nextDotId: null };

    // Sort by sort path projection if available, otherwise by x -> y
    const pathPoints = sortPathsByPartKey.get(selected.wallPart);
    let sorted: typeof wallRoutes;
    if (pathPoints && pathPoints.length >= 2) {
      sorted = [...wallRoutes].sort((a, b) => {
        const projA = projectOntoPolyline({ x: a.x, y: a.y }, pathPoints);
        const projB = projectOntoPolyline({ x: b.x, y: b.y }, pathPoints);
        if (projA.t !== projB.t) return projA.t - projB.t;
        return a.title.localeCompare(b.title);
      });
    } else {
      sorted = [...wallRoutes].sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        if (a.y !== b.y) return a.y - b.y;
        return a.title.localeCompare(b.title);
      });
    }

    const idx = sorted.findIndex(r => r.id === selectedDotId);
    return {
      prevDotId: idx > 0 ? sorted[idx - 1].id : null,
      nextDotId: idx < sorted.length - 1 ? sorted[idx + 1].id : null,
    };
  }, [selectedDotId, routeDots, sortPathsByPartKey]);

  const handlePrevRoute = useCallback(() => {
    if (prevDotId) setSelectedDotId(prevDotId);
  }, [prevDotId]);

  const handleNextRoute = useCallback(() => {
    if (nextDotId) setSelectedDotId(nextDotId);
  }, [nextDotId]);

  const handleSelectDot = useCallback((id: string | null) => {
    setSelectedDotId(id);
    if (id) setIsSearchOpen(false);
  }, []);

  const handleCompleted = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedDotId(null);
  }, []);

  // Search overlay route pop-up state (for search result clicks)
  const [searchPopup, setSearchPopup] = useState<{
    id: string;
    name: string;
    grade: string;
    color: string;
    completions: number;
    attempts: number;
    userGrade: string | null;
    communityGrade: string | null;
    xp: { xp: number; baseXp: number; xpExtrapolated: { type: string; xp: number }[] } | null;
    isArchived: boolean;
    bonusXp: number;
  } | null>(null);

  const handleSearchRouteSelect = useCallback(
    (
      routeId: string,
      name: string,
      grade: string,
      color: string,
      completions: AppRouteCompletion[],
      attempts: AppRouteAttempt[],
      userGrade: string | null,
      communityGrade: string,
      xp: { xp: number; baseXp: number; xpExtrapolated: { type: string; xp: number }[] } | null,
      isArchived: boolean,
      bonusXp: number = 0,
    ) => {
      // Check if this route has a dot on the map, if so select it
      if (routeDots) {
        const dot = routeDots.find(r => r.id === routeId);
        if (dot) {
          setSelectedDotId(dot.id);
          setIsSearchOpen(false);
          return;
        }
      }
      // Otherwise open the legacy popup for non-placed routes
      setSearchPopup({
        id: routeId,
        name,
        grade,
        color,
        completions: completions.length,
        attempts: attempts[0]?.attempts || 0,
        userGrade,
        communityGrade,
        xp,
        isArchived,
        bonusXp,
      });
    },
    [routeDots],
  );

  const handleSearchPopupClose = useCallback(() => {
    setSearchPopup(null);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // ── Mobile: full-blocker download screen ──
  if (isMobile) {
    return (
      <div className="flex h-[calc(100dvh-64px)] flex-col items-center justify-center bg-[#09090B] px-6 font-barlow text-white">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 ring-1 ring-white/[0.08]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Routes are best on the app
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            View the interactive map, complete routes, and track your progress with the full mobile experience.
          </p>

          {/* App store buttons */}
          <div className="mt-8 flex w-full flex-col gap-3">
            <a
              href="#"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-[15px] font-semibold text-black transition active:scale-[0.97]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download on the App Store
            </a>
            <a
              href="#"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-[15px] font-semibold text-black transition active:scale-[0.97]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.19 12l2.508-2.492zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Get it on Google Play
            </a>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] leading-relaxed text-zinc-500">
              You can switch to{" "}
              <span className="font-medium text-zinc-400">&quot;Request Desktop Site&quot;</span>{" "}
              in your browser menu to access the web version, but it is not optimized for mobile and may not work as expected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <RouteCompletionProvider>
      <div className="flex h-[calc(100dvh-64px)] flex-col bg-[#09090B] font-barlow text-white">
        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#08080A]">
          {/* Map canvas */}
          <RoutesDotMapShell
            selectedId={selectedDotId}
            onSelectDot={handleSelectDot}
          />

          {/* Bottom sheet panel */}
          <AnimatePresence>
            {selectedRoute && (
              <RouteSlidePanel
                route={selectedRoute}
                user={user}
                onClose={handleClosePanel}
                onCompleted={handleCompleted}
                onPrev={prevDotId ? handlePrevRoute : undefined}
                onNext={nextDotId ? handleNextRoute : undefined}
              />
            )}
          </AnimatePresence>

          {/* Search overlay toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(prev => !prev)}
            className="absolute right-3 top-3 z-10 flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0c0c0f]/90 px-3 text-zinc-400 shadow-lg backdrop-blur-sm transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            {isSearchOpen ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="text-xs font-medium">Close</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="text-xs font-medium">Search</span>
              </>
            )}
          </button>

          {/* Search overlay */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-3 top-14 z-30 w-[360px] max-h-[calc(100%-80px)] overflow-y-auto rounded-xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4 backdrop-blur-md shadow-2xl"
              >
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search by name or grade..."
                  autoFocus
                  className="mb-3 h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
                {user && searchText && (
                  <SearchRoutes
                    searchText={searchText}
                    onData={handleSearchRouteSelect}
                    user={user}
                    refreshTrigger={refreshTrigger}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search popup for non-placed routes */}
        {searchPopup && (
          <AnimatePresence>
            <RoutePopUp
              onCancel={handleSearchPopupClose}
              id={searchPopup.id}
              name={searchPopup.name}
              grade={searchPopup.grade}
              user={user}
              color={searchPopup.color}
              completions={searchPopup.completions}
              attempts={searchPopup.attempts}
              userGrade={searchPopup.userGrade}
              communityGrade={searchPopup.communityGrade}
              onRouteCompleted={handleCompleted}
              xp={searchPopup.xp}
              isArchived={searchPopup.isArchived}
              bonusXp={searchPopup.bonusXp}
            />
          </AnimatePresence>
        )}
      </div>
    </RouteCompletionProvider>
  );
}
