"use client";
import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import DotMapCanvas, { type DotRoute, type UnplacedRoute } from "./DotMapCanvas";
import RouteDetailsPanel, { type DetailsDraft } from "./RouteDetailsPanel";
import { getViewBox, resolveDotPlacement, routeTypeForWall } from "./snap";
import { colorHex, displayGrade } from "./constants";
import { wallPartLabel } from "@/lib/wallLocations";
import type { WallPartKey } from "@/lib/wallLocations";
import { getRouteXp } from "@/lib/route-shared";
import type { TopdownMapData } from "@/lib/topdown";

type Mode = "view" | "create" | "edit";

type RouteEntry = {
  _id: string;
  title: string;
  color: string;
  grade: string;
  type: "BOULDER" | "ROPE";
  x: number | null;
  y: number | null;
  wallPart: string | null;
};

type Props = {
  map: TopdownMapData;
  routes: RouteEntry[];
};

const EMPTY_DRAFT: DetailsDraft = {
  title: "",
  color: "red",
  grade: "v0",
  wallPart: null,
};

export default function RouteDotManager({ map, routes }: Props) {
  const [mode, setMode] = useState<Mode>("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [draft, setDraft] = useState<DetailsDraft>(EMPTY_DRAFT);
  const [activeDotPos, setActiveDotPos] = useState<{ x: number; y: number } | null>(null);
  const [activeWallPart, setActiveWallPart] = useState<WallPartKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [editOverrides, setEditOverrides] = useState<Record<string, { x: number; y: number }>>({});

  const createRoute = useMutation(api.routes.createRoute);
  const updateRoute = useMutation(api.routes.updateRoute);
  const setRouteArchived = useMutation(api.routes.setRouteArchived);

  const view = useMemo(() => getViewBox(map.svgView), [map.svgView]);

  // Build dots array for DotMapCanvas — includes placed routes + unplaced routes that have an override
  const dots: DotRoute[] = useMemo(() => {
    const result: DotRoute[] = [];
    for (const r of routes) {
      const override = editOverrides[r._id];
      const hasPosition = r.x != null && r.y != null;
      if (hasPosition) {
        result.push({
          id: r._id,
          color: r.color,
          title: r.title,
          grade: r.grade,
          x: override?.x ?? r.x!,
          y: override?.y ?? r.y!,
        });
      } else if (override) {
        // Unplaced route that now has a temporary position from edit selection
        result.push({
          id: r._id,
          color: r.color,
          title: r.title,
          grade: r.grade,
          x: override.x,
          y: override.y,
        });
      }
    }
    return result;
  }, [routes, editOverrides]);

  // Build unplaced routes list for edit mode (exclude ones that already have an override position)
  const unplacedRoutes: UnplacedRoute[] = useMemo(() => {
    if (mode !== "edit") return [];
    return routes
      .filter(r => (r.x == null || r.y == null) && !editOverrides[r._id])
      .map(r => ({
        id: r._id,
        color: r.color,
        title: r.title,
        grade: r.grade,
      }));
  }, [routes, mode, editOverrides]);

  const placedCount = useMemo(() => routes.filter(r => r.x != null && r.y != null).length, [routes]);
  const unplacedCount = useMemo(() => routes.filter(r => r.x == null || r.y == null).length, [routes]);

  const selectedRoute = useMemo(
    () => (selectedId ? routes.find(r => r._id === selectedId) ?? null : null),
    [selectedId, routes],
  );

  // --- Mode transitions ---

  const enterCreateMode = useCallback(() => {
    const cx = view.minX + view.width / 2;
    const cy = view.minY + view.height / 2;
    const resolved = resolveDotPlacement({ x: cx, y: cy }, map.walls, view, true);
    setMode("create");
    setSelectedId(null);
    setActiveDotPos(resolved.position);
    setActiveWallPart(resolved.wallPart);
    setDraft({ ...EMPTY_DRAFT, wallPart: resolved.wallPart });
    setEditOverrides({});
  }, [view, map.walls]);

  const enterEditMode = useCallback(() => {
    setMode("edit");
    setSelectedId(null);
    setActiveDotPos(null);
    setActiveWallPart(null);
    setDraft(EMPTY_DRAFT);
    setEditOverrides({});
  }, []);

  const exitToView = useCallback(() => {
    setMode("view");
    setSelectedId(null);
    setActiveDotPos(null);
    setActiveWallPart(null);
    setDraft(EMPTY_DRAFT);
    setSaving(false);
    setEditOverrides({});
  }, []);

  // --- Dot interaction callbacks ---

  const handleSelectDot = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedId(null);
        return;
      }

      const route = routes.find(r => r._id === id);
      if (!route) return;

      // Always enter edit mode when a dot is tapped
      if (mode !== "edit") {
        setMode("edit");
        setActiveDotPos(null);
        setEditOverrides({});
      }

      setSelectedId(id);

      const wp = route.wallPart as WallPartKey | null;
      setDraft({
        title: route.title,
        color: route.color,
        grade: route.grade,
        wallPart: wp,
      });
      setActiveWallPart(wp);

      // If the route has no placement, spawn a draggable dot
      const isUnplaced = route.x == null || route.y == null;
      if (isUnplaced && !editOverrides[id]) {
        // If the route already has a wallPart, place near that wall's center
        let spawnX = view.minX + view.width / 2;
        let spawnY = view.minY + view.height / 2;
        if (wp) {
          const targetWall = map.walls.find(w => w.partKey === wp);
          if (targetWall && targetWall.shapes.length > 0) {
            let totalPts = 0;
            let sumX = 0;
            let sumY = 0;
            for (const shape of targetWall.shapes) {
              const pts = shape.points;
              const attrs = shape.attributes;
              if (pts && pts.length > 0) {
                for (const p of pts) { sumX += p.x; sumY += p.y; totalPts++; }
              } else if (attrs?.segStartX && attrs?.segEndX) {
                const sx = Number(attrs.segStartX), sy = Number(attrs.segStartY);
                const ex = Number(attrs.segEndX), ey = Number(attrs.segEndY);
                sumX += sx + ex; sumY += sy + ey; totalPts += 2;
              } else if (shape.bounds) {
                sumX += shape.bounds.x + shape.bounds.width / 2;
                sumY += shape.bounds.y + shape.bounds.height / 2;
                totalPts++;
              }
            }
            if (totalPts > 0) {
              spawnX = sumX / totalPts;
              spawnY = sumY / totalPts;
            }
          }
        }
        const resolved = resolveDotPlacement({ x: spawnX, y: spawnY }, map.walls, view, true);
        setEditOverrides(prev => ({ ...prev, [id]: resolved.position }));
        setActiveWallPart(resolved.wallPart);
        setDraft(prev => ({ ...prev, wallPart: resolved.wallPart }));
      }
    },
    [mode, routes, view, map.walls, editOverrides],
  );

  const handleDragMove = useCallback(
    (pos: { x: number; y: number }, wallPart: WallPartKey | null) => {
      if (mode === "create") {
        setActiveDotPos(pos);
        setActiveWallPart(wallPart);
        setDraft(prev => ({ ...prev, wallPart }));
      } else if (mode === "edit" && selectedId) {
        setEditOverrides(prev => ({ ...prev, [selectedId]: pos }));
        setActiveWallPart(wallPart);
        setDraft(prev => ({ ...prev, wallPart }));
      }
    },
    [mode, selectedId],
  );

  // --- Create action ---

  const handleCreate = useCallback(async () => {
    if (!activeDotPos || !draft.wallPart || !draft.grade) return;
    setSaving(true);
    try {
      const type = routeTypeForWall(draft.wallPart);
      const xp = getRouteXp(draft.grade) ?? 0;
      await createRoute({
        title: draft.title,
        color: draft.color,
        grade: draft.grade,
        wallPart: draft.wallPart,
        type,
        xp,
        x: activeDotPos.x,
        y: activeDotPos.y,
        setDate: Date.now(),
      });
      exitToView();
    } catch (err) {
      console.error("Failed to create route:", err);
      setSaving(false);
    }
  }, [activeDotPos, draft, createRoute, exitToView]);

  // --- Edit save action ---

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const override = editOverrides[selectedId];
      await updateRoute({
        routeId: selectedId,
        newTitle: draft.title,
        newColor: draft.color,
        newGrade: draft.grade,
        newLocation: draft.wallPart ?? undefined,
        newX: override?.x ?? undefined,
        newY: override?.y ?? undefined,
      });
      // Stay in edit mode, just deselect
      setSelectedId(null);
      setDraft(EMPTY_DRAFT);
      setActiveWallPart(null);
      setSaving(false);
      // Clean up this route's override since it's now persisted
      setEditOverrides(prev => {
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
    } catch (err) {
      console.error("Failed to update route:", err);
      setSaving(false);
    }
  }, [selectedId, draft, editOverrides, updateRoute]);

  // --- Archive action ---

  const handleArchive = useCallback(async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await setRouteArchived({ routeIds: [selectedId], isArchived: true });
      // Stay in edit mode, just deselect
      setSelectedId(null);
      setDraft(EMPTY_DRAFT);
      setActiveWallPart(null);
      setSaving(false);
      setEditOverrides(prev => {
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
    } catch (err) {
      console.error("Failed to archive route:", err);
      setSaving(false);
    }
  }, [selectedId, setRouteArchived]);

  // --- Active dot for canvas ---

  const activeDot = useMemo(() => {
    if (mode !== "create" || !activeDotPos) return null;
    return { position: activeDotPos, color: colorHex(draft.color) };
  }, [mode, activeDotPos, draft.color]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#09090B]">
      {/* ── Canvas ────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#08080A]">
        <DotMapCanvas
          map={map}
          dots={dots}
          unplacedRoutes={unplacedRoutes}
          selectedId={selectedId}
          activeDot={activeDot}
          snap={snapEnabled}
          mode={mode}
          showLabels={showLabels}
          onSelectDot={handleSelectDot}
          onDragMove={handleDragMove}
        />

        {/* Floating mode badge — bottom-center */}
        {mode !== "view" && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c0c0f]/90 px-3 py-1.5 shadow-xl backdrop-blur-sm">
              <span className={clsx(
                "h-1.5 w-1.5 rounded-full",
                mode === "create" ? "bg-emerald-400" : "bg-blue-400",
              )} />
              <span className="text-[11px] font-medium text-zinc-300">
                {mode === "create" ? "Creating route — drag dot to place" : "Edit mode — tap a dot to select"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Right sidebar ────────────────────────────────────── */}
      <div className="flex w-[360px] min-w-[360px] flex-col border-l border-white/[0.06] bg-[#0C0C0F]">
        {/* Sidebar header */}
        <div className="shrink-0 border-b border-white/[0.06] p-3">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-zinc-400 transition hover:text-zinc-200"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px] font-semibold">Route Manager</span>
            </Link>

            <div className="flex items-center gap-1.5">
              {mode === "view" && (
                <>
                  <button
                    type="button"
                    onClick={enterEditMode}
                    className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={enterCreateMode}
                    className="flex h-7 items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New
                  </button>
                </>
              )}
              {mode !== "view" && (
                <button
                  type="button"
                  onClick={exitToView}
                  className="flex h-7 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  {mode === "create" ? "Cancel" : "Done"}
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/15 px-1 text-[9px] font-bold text-emerald-400">
                {placedCount}
              </span>
              <span className="text-[10px] font-medium text-zinc-500">Placed</span>
            </div>
            {unplacedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/15 px-1 text-[9px] font-bold text-red-400">
                  {unplacedCount}
                </span>
                <span className="text-[10px] font-medium text-zinc-500">Unplaced</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/[0.06] px-1 text-[9px] font-bold text-zinc-400">
                {routes.length}
              </span>
              <span className="text-[10px] font-medium text-zinc-500">Total</span>
            </div>
          </div>
        </div>

        {/* Toggles bar */}
        {mode !== "view" && (
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <button
              type="button"
              onClick={() => setSnapEnabled(prev => !prev)}
              className={clsx(
                "flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10px] font-medium uppercase tracking-[0.08em] transition",
                snapEnabled
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                  : "border-white/[0.06] text-zinc-500 hover:border-white/20 hover:text-zinc-300",
              )}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12" />
                <polyline points="6 12 2 12" />
                <polyline points="12 6 12 2" />
                <polyline points="12 22 12 18" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Snap
            </button>
            <button
              type="button"
              onClick={() => setShowLabels(prev => !prev)}
              className={clsx(
                "flex h-6 items-center gap-1.5 rounded-md border px-2 text-[10px] font-medium uppercase tracking-[0.08em] transition",
                showLabels
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                  : "border-white/[0.06] text-zinc-500 hover:border-white/20 hover:text-zinc-300",
              )}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              Labels
            </button>
          </div>
        )}

        {/* Panel content — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {/* CREATE mode panel */}
          {mode === "create" && (
            <div className="p-3">
              <RouteDetailsPanel
                mode="create"
                draft={draft}
                onChange={setDraft}
                onPrimary={handleCreate}
                onCancel={exitToView}
                primaryDisabled={!activeDotPos || !draft.wallPart || !draft.grade}
                primaryLoading={saving}
              />
            </div>
          )}

          {/* EDIT mode — selected route panel */}
          {mode === "edit" && selectedId && (
            <div className="p-3">
              <RouteDetailsPanel
                mode="edit"
                draft={draft}
                onChange={setDraft}
                onPrimary={handleSave}
                onCancel={() => {
                  // If this was an unplaced route, remove its temporary override
                  if (selectedId && selectedRoute && selectedRoute.x == null) {
                    setEditOverrides(prev => {
                      const next = { ...prev };
                      delete next[selectedId];
                      return next;
                    });
                  }
                  setSelectedId(null);
                }}
                onDelete={handleArchive}
                primaryDisabled={!draft.grade || (selectedRoute != null && selectedRoute.x == null && !editOverrides[selectedId]?.x)}
                primaryLoading={saving}
              />
            </div>
          )}

          {/* EDIT mode — no selection: show route list */}
          {mode === "edit" && !selectedId && (
            <div className="p-3 space-y-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
                  Edit mode
                </p>
                <p className="text-[11px] text-zinc-400">
                  Tap a dot on the map or select a route below to edit.
                </p>
              </div>

              {/* Unplaced routes */}
              {unplacedRoutes.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-red-400/80 mb-1.5">
                    Unplaced ({unplacedRoutes.length})
                  </p>
                  <div className="space-y-1">
                    {unplacedRoutes.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectDot(r.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-2 text-left transition hover:border-red-500/30 hover:bg-red-500/10"
                      >
                        <span
                          className="block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-red-500/40"
                          style={{ backgroundColor: colorHex(r.color) }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-zinc-200">
                            {r.title || "Unnamed"}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono text-zinc-500">
                          {displayGrade(r.grade)}
                        </span>
                        <span className="shrink-0 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-medium text-red-400">
                          No placement
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Placed routes */}
              {dots.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
                    Placed ({dots.length})
                  </p>
                  <div className="space-y-1">
                    {dots.map(d => {
                      const route = routes.find(r => r._id === d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectDot(d.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                        >
                          <span
                            className="block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: colorHex(d.color) }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-zinc-200">
                              {d.title || "Unnamed"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-mono text-zinc-500">
                            {displayGrade(d.grade)}
                          </span>
                          {route?.wallPart && (
                            <span className="shrink-0 max-w-[80px] truncate text-[9px] text-zinc-600">
                              {wallPartLabel(route.wallPart as WallPartKey)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW mode — summary */}
          {mode === "view" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-zinc-400">
                  {routes.length} route{routes.length !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Tap a dot on the map to edit it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
