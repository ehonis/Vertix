"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { useXpIntegration } from "@/app/hooks/useXpIntegration";
import { useRouteCompletion } from "@/app/contexts/routeCompletionContext";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import Link from "next/link";
import {
  getGradeRange,
  isGradeHigher,
  calculateCompletionXpForRoute,
} from "@/lib/route-shared";
import { colorHex } from "@/app/ui/admin/route-manager/constants";
import type { AppUser } from "@/lib/appUser";

export type RoutePanelData = {
  id: string;
  convexId: string;
  title: string;
  grade: string;
  color: string;
  type: "BOULDER" | "ROPE";
  xp: number;
  bonusXp: number;
  wallPart: string | null;
  completionCount: number;
  attemptCount: number;
  isArchived: boolean;
};

type Props = {
  route: RoutePanelData;
  user: AppUser | null | undefined;
  onClose: () => void;
  onCompleted: () => void;
};

export default function RouteSlidePanel({ route, user, onClose, onCompleted }: Props) {
  const { showNotification } = useNotification();
  const { isToday, toggleIsToday, isFlash, toggleIsFlash, date, setDate, getEffectiveDate } =
    useRouteCompletion();
  const router = useRouter();
  const { gainRouteCompletionXp } = useXpIntegration(user?.id);

  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [isAttemptLoading, setIsAttemptLoading] = useState(false);
  const [isGradeLoading, setIsGradeLoading] = useState(false);
  const [frontendCompletions, setFrontendCompletions] = useState(route.completionCount);
  const [frontendAttempts, setFrontendAttempts] = useState(route.attemptCount);
  const [isFrontendCompleted, setIsFrontendCompleted] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [frontendCommunityGrade, setFrontendCommunityGrade] = useState("");

  const routeType = route.grade.startsWith("5") ? "rope" : "boulder";
  const gradeRange = getGradeRange(route.grade);
  const isFeatureGrade =
    route.grade.toLowerCase() === "vfeature" || route.grade.toLowerCase() === "5.feature";

  const [currentXp, setCurrentXp] = useState(() => {
    if (!user || route.isArchived) return null;
    return calculateCompletionXpForRoute({
      grade: route.grade,
      previousCompletions: route.completionCount,
      newHighestGrade: isGradeHigher(user as any, route.grade, routeType),
      bonusXp: route.bonusXp || 0,
    });
  });

  useEffect(() => {
    setFrontendCompletions(route.completionCount);
    setFrontendAttempts(route.attemptCount);
    setIsFrontendCompleted(false);
    setSelectedGrade("");
    setFrontendCommunityGrade("");
    if (user && !route.isArchived) {
      setCurrentXp(
        calculateCompletionXpForRoute({
          grade: route.grade,
          previousCompletions: route.completionCount,
          newHighestGrade: isGradeHigher(user as any, route.grade, routeType),
          bonusXp: route.bonusXp || 0,
        }),
      );
    } else {
      setCurrentXp(null);
    }
  }, [route.id, route.completionCount, route.attemptCount, user, route.isArchived, route.grade, route.bonusXp, routeType]);

  const handleQuickComplete = useCallback(async () => {
    if (!user) {
      showNotification({ message: "Sign in to complete routes", color: "red" });
      return;
    }
    setIsCompletionLoading(true);
    try {
      const response = await fetch("/api/routes/complete-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          routeId: route.id,
          flash: isFlash,
          date: getEffectiveDate(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showNotification({ message: data.message, color: "red" });
      } else {
        showNotification({ message: `Sent ${route.title}!`, color: "green" });
        setIsFrontendCompleted(true);
        setFrontendCompletions(prev => prev + 1);

        if (!route.isArchived) {
          gainRouteCompletionXp({
            grade: route.grade,
            previousCompletions: frontendCompletions,
            newHighestGrade: isGradeHigher(user as any, route.grade, routeType),
            bonusXp: route.bonusXp || 0,
          });
          setCurrentXp(
            calculateCompletionXpForRoute({
              grade: route.grade,
              previousCompletions: frontendCompletions + 1,
              newHighestGrade: false,
              bonusXp: route.bonusXp || 0,
            }),
          );
        }
        router.refresh();
        onCompleted();
      }
    } catch {
      showNotification({ message: "Error completing route", color: "red" });
    } finally {
      setIsCompletionLoading(false);
    }
  }, [user, route, isFlash, getEffectiveDate, frontendCompletions, routeType, gainRouteCompletionXp, router, onCompleted, showNotification]);

  const handleRouteAttempt = useCallback(async () => {
    if (!user) {
      showNotification({ message: "Sign in to attempt routes", color: "red" });
      return;
    }
    setIsAttemptLoading(true);
    try {
      const response = await fetch("/api/routes/attempt-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, routeId: route.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        showNotification({ message: data.message, color: "red" });
      } else {
        showNotification({ message: `Attempted ${route.title}`, color: "green" });
        setFrontendAttempts(prev => prev + 1);
        router.refresh();
      }
    } catch {
      showNotification({ message: "Error attempting route", color: "red" });
    } finally {
      setIsAttemptLoading(false);
    }
  }, [user, route, router, showNotification]);

  const handleGradeSubmission = useCallback(async () => {
    if (!user || !selectedGrade) return;
    setIsGradeLoading(true);
    try {
      const response = await fetch("/api/routes/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, routeId: route.id, selectedGrade }),
      });
      if (!response.ok) {
        showNotification({ message: "Error grading route", color: "red" });
      } else {
        showNotification({ message: "Grade submitted!", color: "green" });
        setFrontendCommunityGrade(selectedGrade);
      }
    } catch {
      showNotification({ message: "Error grading route", color: "red" });
    } finally {
      setIsGradeLoading(false);
    }
  }, [user, route, selectedGrade, showNotification]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    if (selected > today) {
      showNotification({ message: "Cannot complete routes in the future!", color: "red" });
      setDate(today);
      return;
    }
    setDate(selected);
  };

  const dotColor = colorHex(route.color);
  const hasCompleted = frontendCompletions > 0 || isFrontendCompleted;

  return (
    <>
      {/* Bottom sheet — pointer-events only on the sheet itself so the map stays interactive */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        className="absolute bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 pointer-events-none"
      >
        <div className="pointer-events-auto rounded-t-2xl border border-b-0 border-white/[0.08] bg-[#111114] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-white/[0.12]" />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pb-3 pt-1">
            {/* Color dot + completed badge */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <span
                className="block h-4 w-4 shrink-0 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: dotColor }}
              />
              {hasCompleted && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>

            {/* Title / grade / XP */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[17px] font-bold text-white font-barlow leading-tight">
                {route.title}
              </h2>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-sm font-semibold italic text-zinc-400 font-barlow">
                  {route.grade}
                </span>
                {currentXp && !route.isArchived && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-px text-[11px] font-bold text-emerald-400">
                    {currentXp.xp} XP
                  </span>
                )}
                {route.isArchived && (
                  <span className="rounded-full border border-zinc-600/30 bg-zinc-600/10 px-2 py-px text-[11px] font-medium text-zinc-500">
                    Archived
                  </span>
                )}
              </div>

              {/* Stats pills */}
              {(frontendCompletions > 0 || frontendAttempts > 0) && (
                <div className="mt-1.5 flex items-center gap-3">
                  {frontendCompletions > 0 && (
                    <span className="text-[11px] text-zinc-500">
                      <span className="font-semibold text-emerald-400">{frontendCompletions}</span> send{frontendCompletions !== 1 ? "s" : ""}
                    </span>
                  )}
                  {frontendAttempts > 0 && (
                    <span className="text-[11px] text-zinc-500">
                      <span className="font-semibold text-orange-400">{frontendAttempts}</span> attempt{frontendAttempts !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500 transition hover:bg-white/[0.1] hover:text-zinc-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-white/[0.06]" />

          {/* Body */}
          <div className="max-h-[50vh] overflow-y-auto px-5 py-4 space-y-4">
            {!user ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                <p className="text-sm text-zinc-400 mb-3">Sign in to complete or attempt this route</p>
                <Link
                  href="/signin"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Action buttons */}
                <div className="flex gap-2.5">
                  <button
                    onClick={handleRouteAttempt}
                    disabled={isAttemptLoading}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.97] disabled:opacity-50"
                  >
                    {isAttemptLoading ? <ElementLoadingAnimation size={4} /> : "Attempt"}
                  </button>
                  <button
                    onClick={handleQuickComplete}
                    disabled={isCompletionLoading}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.97] disabled:opacity-50"
                  >
                    {isCompletionLoading ? <ElementLoadingAnimation size={4} /> : "Complete"}
                  </button>
                </div>

                {/* Community grading */}
                {!isFeatureGrade && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Community Grade
                    </p>
                    {frontendCommunityGrade ? (
                      <p className="text-sm text-zinc-300">
                        You graded this{" "}
                        <span className="font-bold text-white">{frontendCommunityGrade.toUpperCase()}</span>
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-sm text-zinc-300 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                          onChange={e => setSelectedGrade(e.target.value)}
                          value={selectedGrade}
                        >
                          <option value="">Select grade</option>
                          {gradeRange.map(g => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        {selectedGrade && (
                          <button
                            onClick={handleGradeSubmission}
                            disabled={isGradeLoading}
                            className="flex h-9 items-center rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                          >
                            {isGradeLoading ? <ElementLoadingAnimation size={3} /> : "Submit"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Options */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Options
                  </p>

                  {/* Today toggle */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={toggleIsToday}
                      className={clsx(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        isToday
                          ? "border-emerald-500/40 bg-emerald-500/20"
                          : "border-white/[0.12] bg-white/[0.04]",
                      )}
                    >
                      {isToday && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <div className="text-xs text-zinc-400">
                      Completion date:{" "}
                      {isToday ? (
                        <span className="text-emerald-400 font-medium">Today</span>
                      ) : (
                        <input
                          type="date"
                          value={date.toISOString().split("T")[0]}
                          onChange={handleDateChange}
                          className="ml-1 rounded-md bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 text-xs text-zinc-300 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Flash toggle */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={toggleIsFlash}
                      className={clsx(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        isFlash
                          ? "border-emerald-500/40 bg-emerald-500/20"
                          : "border-white/[0.12] bg-white/[0.04]",
                      )}
                    >
                      {isFlash && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <div className="text-xs text-zinc-400">
                      Flash mode:{" "}
                      {isFlash ? (
                        <span className="text-emerald-400 font-medium">ON</span>
                      ) : (
                        <span className="text-zinc-600">OFF</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Safe area spacer for iPhones */}
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </motion.div>
    </>
  );
}
