"use client";

import React from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { DrawingMode, DrawingTarget, EditableWall, EditableShape, WallSortPathMap } from "./MapEditorShell";

type WallPanelProps = {
  walls: EditableWall[];
  setWalls: React.Dispatch<React.SetStateAction<EditableWall[]>>;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  selectedShapeIndex: number | null;
  setSelectedShapeIndex: (index: number | null) => void;
  zones: Doc<"gymZones">[];
  onDelete: (index: number) => void;
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  setDrawingTarget: (target: DrawingTarget) => void;
  onCopyShape: (owner: "wall" | "feature", ownerIndex: number, shapeIndex: number) => void;
  onPasteShape: () => void;
  hasClipboard: boolean;
  wallSortPaths: WallSortPathMap;
  setWallSortPaths: React.Dispatch<React.SetStateAction<WallSortPathMap>>;
  showSortPaths: boolean;
  setShowSortPaths: React.Dispatch<React.SetStateAction<boolean>>;
};

export function WallPanel({
  walls,
  setWalls,
  selectedIndex,
  setSelectedIndex,
  zones,
  onDelete,
  drawingMode,
  setDrawingMode,
  setDrawingTarget,
  selectedShapeIndex,
  setSelectedShapeIndex,
  onCopyShape,
  onPasteShape,
  hasClipboard,
  wallSortPaths,
  setWallSortPaths,
  showSortPaths,
  setShowSortPaths,
}: WallPanelProps) {
  const selectedWall = selectedIndex !== null ? walls[selectedIndex] : null;
  const anySortPaths = walls.some((w) => w._id && wallSortPaths[w._id] && wallSortPaths[w._id].length >= 2);

  return (
    <div className="flex flex-col text-white">
      {/* ── Wall list section ─────────────────────────────────── */}
      <div className="border-b border-white/[0.06] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Walls
          </h3>
          <div className="flex items-center gap-1.5">
            {anySortPaths && (
              <button
                className={`flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-medium transition ${
                  showSortPaths
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                    : "bg-white/[0.04] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-400"
                }`}
                onClick={() => setShowSortPaths((prev) => !prev)}
                title={showSortPaths ? "Hide sort paths" : "Show sort paths"}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>
            )}
            <button
            className="flex h-6 items-center gap-1 rounded-md border border-dashed border-white/[0.1] px-2 text-[11px] font-medium text-zinc-400 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400"
            onClick={() => {
              setWalls((prev) => [
                ...prev,
                {
                  gymZoneId: "",
                  slug: `wall-${prev.length + 1}`,
                  name: `Wall ${prev.length + 1}`,
                  partKey: `wall-${prev.length + 1}`,
                  fillColor: "#1447E6",
                  fillOpacity: 0.9,
                  strokeColor: undefined,
                  strokeWidth: undefined,
                  bounds: { x: 0, y: 0, width: 40, height: 20 },
                  shapes: [],
                  isInteractive: true,
                  isActive: true,
                  allowOverflow: false,
                  sortOrder: prev.length,
                },
              ]);
              setSelectedIndex(walls.length);
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
          </div>
        </div>

        {walls.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </div>
            <p className="text-[12px] text-zinc-500">No walls yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {walls.map((wall, index) => (
              <button
                key={wall._id ?? `${wall.partKey}-${index}`}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  index === selectedIndex
                    ? "bg-blue-500/10 ring-1 ring-blue-500/30"
                    : "hover:bg-white/[0.04]"
                }`}
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded"
                  style={{ backgroundColor: wall.fillColor }}
                />
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[12px] font-medium leading-tight">{wall.name || `Wall ${index + 1}`}</span>
                  {wall.gymZoneId ? (
                    <span className="truncate text-[10px] text-zinc-500">{zones.find((z) => z._id === wall.gymZoneId)?.name ?? "Unknown zone"}</span>
                  ) : (
                    <span className="text-[10px] text-amber-500/70">No zone assigned</span>
                  )}
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-white/[0.04] px-1 text-[10px] tabular-nums text-zinc-500">
                  {wall.shapes.length}
                </span>
                {wall._id && wallSortPaths[wall._id] && wallSortPaths[wall._id].length >= 2 && (
                  <span className="flex h-5 items-center rounded-md bg-amber-500/10 px-1.5 text-[9px] font-medium text-amber-500" title="Has sort path">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Wall detail section ───────────────────────────────── */}
      {selectedWall && selectedIndex !== null && (
        <div className="flex flex-col">
          {/* Properties */}
          <div className="space-y-3 border-b border-white/[0.06] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Properties</h3>

            <div className="grid grid-cols-2 gap-2">
              <TextField label="Name" value={selectedWall.name} onChange={(value) => patchWall(setWalls, selectedIndex, { name: value })} />
              <TextField label="Slug" value={selectedWall.slug} onChange={(value) => patchWall(setWalls, selectedIndex, { slug: value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Part Key" value={selectedWall.partKey} onChange={(value) => patchWall(setWalls, selectedIndex, { partKey: value })} />
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Zone</label>
                <select
                  className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[12px] text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  value={selectedWall.gymZoneId}
                  onChange={(event) => patchWall(setWalls, selectedIndex, { gymZoneId: (event.target.value as Id<"gymZones">) || "" })}
                >
                  <option value="">Select zone...</option>
                  {zones.map((zone) => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color + flags row */}
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Fill</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent"
                    value={selectedWall.fillColor}
                    onChange={(event) => patchWall(setWalls, selectedIndex, { fillColor: event.target.value })}
                  />
                  <span className="font-mono text-[11px] text-zinc-400">{selectedWall.fillColor}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {QUICK_PICK_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-6 w-6 rounded-md border transition ${selectedWall.fillColor === color ? "border-white ring-1 ring-white/50" : "border-white/[0.08] hover:border-white/25"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => patchWall(setWalls, selectedIndex, { fillColor: color })}
                      aria-label={`Use ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Opacity</label>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  className="h-8 w-20 accent-blue-500"
                  value={selectedWall.fillOpacity}
                  onChange={(event) => patchWall(setWalls, selectedIndex, { fillOpacity: Number(event.target.value) })}
                />
                <span className="ml-1 text-[10px] tabular-nums text-zinc-500">{Math.round(selectedWall.fillOpacity * 100)}%</span>
              </div>
            </div>

            {/* Outline */}
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Outline</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent"
                    value={selectedWall.strokeColor ?? "#FFFFFF"}
                    onChange={(event) => patchWall(setWalls, selectedIndex, { strokeColor: event.target.value })}
                  />
                  <input
                    type="number"
                    min={0} max={10} step={0.5}
                    className="h-8 w-14 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-center text-[11px] tabular-nums text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50"
                    placeholder="0"
                    value={selectedWall.strokeWidth ?? ""}
                    onChange={(event) => {
                      const v = event.target.value === "" ? undefined : Number(event.target.value);
                      patchWall(setWalls, selectedIndex, { strokeWidth: v });
                    }}
                  />
                  <span className="text-[9px] text-zinc-600">px</span>
                  {selectedWall.strokeColor && (
                    <button
                      className="rounded px-1.5 py-0.5 text-[9px] text-zinc-500 transition hover:bg-white/[0.06] hover:text-red-400"
                      onClick={() => patchWall(setWalls, selectedIndex, { strokeColor: undefined, strokeWidth: undefined })}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <CheckField label="Interactive" checked={selectedWall.isInteractive} onChange={(value) => patchWall(setWalls, selectedIndex, { isInteractive: value })} />
              <CheckField label="Active" checked={selectedWall.isActive} onChange={(value) => patchWall(setWalls, selectedIndex, { isActive: value })} />
              <CheckField label="Allow Overflow" checked={selectedWall.allowOverflow} onChange={(value) => patchWall(setWalls, selectedIndex, { allowOverflow: value })} />
            </div>
          </div>

          {/* Drawing tools */}
          <div className="space-y-3 border-b border-white/[0.06] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Draw Shape</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { mode: "segment" as const, label: "Segment", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> },
                { mode: "polygon" as const, label: "Polygon", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l10 7-4 11H6L2 9z"/></svg> },
              ] as const).map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition ${
                    drawingMode === mode
                      ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                      : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  onClick={() => {
                    setDrawingTarget({ type: "wall", wallIndex: selectedIndex });
                    setDrawingMode(mode);
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
              <button
                className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition ${
                  drawingMode === "triangle"
                    ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                    : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
                onClick={() => {
                  setDrawingTarget({ type: "wall", wallIndex: selectedIndex });
                  setDrawingMode("triangle");
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L22 21H2z"/></svg>
                Triangle
              </button>
            </div>
          </div>

          {/* Sort Direction */}
          <div className="space-y-3 border-b border-white/[0.06] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Sort Direction</h3>
            {(() => {
              const wallId = selectedWall._id;
              const hasSortPath = wallId && wallSortPaths[wallId] && wallSortPaths[wallId].length >= 2;
              return (
                <div className="flex flex-col gap-2">
                  {hasSortPath ? (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 px-2.5 py-2 ring-1 ring-amber-500/20">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-[11px] font-medium text-amber-400">
                          {wallSortPaths[wallId!].length} point path defined
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition ${
                            drawingMode === "sortPath"
                              ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                              : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          }`}
                          onClick={() => {
                            // Clear existing and redraw
                            if (wallId) {
                              setWallSortPaths((prev) => {
                                const next = { ...prev };
                                delete next[wallId];
                                return next;
                              });
                            }
                            setDrawingTarget({ type: "wall", wallIndex: selectedIndex });
                            setDrawingMode("sortPath");
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                          Redraw
                        </button>
                        <button
                          className="flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold bg-white/[0.03] text-red-400/80 hover:bg-red-500/5 hover:text-red-400 transition"
                          onClick={() => {
                            if (wallId) {
                              setWallSortPaths((prev) => {
                                const next = { ...prev };
                                delete next[wallId];
                                return next;
                              });
                            }
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-zinc-500">
                        Draw a path along the wall to define route sort order (left-to-right).
                      </p>
                      <button
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-semibold transition ${
                          drawingMode === "sortPath"
                            ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                            : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                        }`}
                        onClick={() => {
                          setDrawingTarget({ type: "wall", wallIndex: selectedIndex });
                          setDrawingMode("sortPath");
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                        </svg>
                        Draw Sort Path
                      </button>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Shapes list */}
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Shapes
              </h3>
              <div className="flex items-center gap-1.5">
                {hasClipboard && (
                  <button
                    className="flex h-5 items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 text-[10px] font-medium text-emerald-400 transition hover:bg-emerald-500/20"
                    onClick={onPasteShape}
                    title="Paste shape (Ctrl+V)"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    Paste
                  </button>
                )}
                <span className="text-[10px] tabular-nums text-zinc-600">{selectedWall.shapes.length}</span>
              </div>
            </div>

            {selectedWall.shapes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/[0.06] py-5">
                <p className="text-[11px] text-zinc-500">No shapes yet</p>
                <p className="text-[10px] text-zinc-600">Use the drawing tools above</p>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedWall.shapes.map((shape, shapeIndex) => (
                  <div
                    key={shape.id}
                    className={`cursor-pointer rounded-lg p-2 transition ${
                      shapeIndex === selectedShapeIndex
                        ? "bg-blue-500/10 ring-1 ring-blue-500/30"
                        : "bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                    onClick={() => setSelectedShapeIndex(shapeIndex)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] capitalize text-zinc-400">{shape.type}</span>
                      <span className="flex-1" />
                      <button
                        className="rounded-md px-1.5 py-0.5 text-[10px] text-zinc-600 transition hover:bg-blue-500/10 hover:text-blue-400"
                        title="Copy shape (Ctrl+C)"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyShape("wall", selectedIndex, shapeIndex);
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button
                        className="rounded-md px-1.5 py-0.5 text-[10px] text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWalls((prev) =>
                            prev.map((wall, wallIndex) => {
                              if (wallIndex !== selectedIndex) return wall;
                              const nextShapes = wall.shapes.filter((_, index) => index !== shapeIndex);
                              return { ...wall, shapes: nextShapes, bounds: nextShapes.length ? getWallBounds(nextShapes) : { x: 0, y: 0, width: 0, height: 0 } };
                            })
                          );
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                    {/* Inline edit fields */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {shape.type === "segment" && shape.segment && (
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-zinc-600">W</label>
                          <input
                            type="number"
                            min={4}
                            step={1}
                            className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                            title="Thickness"
                            value={shape.segment.thickness}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => {
                              const thickness = Math.max(4, Number(event.target.value) || 4);
                              setWalls((prev) =>
                                prev.map((wall, wallIndex) => {
                                  if (wallIndex !== selectedIndex) return wall;
                                  const nextShapes = wall.shapes.map((candidate, index) =>
                                    index === shapeIndex && candidate.type === "segment" && candidate.segment
                                      ? { ...candidate, segment: { ...candidate.segment, thickness }, bounds: getWallBounds([{ ...candidate, segment: { ...candidate.segment, thickness } }]) }
                                      : candidate
                                  );
                                  return { ...wall, shapes: nextShapes, bounds: getWallBounds(nextShapes) };
                                })
                              );
                            }}
                          />
                        </div>
                      )}
                      {shape.type === "segment" && shape.segment && (
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-zinc-600">L</label>
                          <input
                            type="number"
                            min={2}
                            step={1}
                            className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                            title="Length"
                            value={Math.round(Math.hypot(shape.segment.end.x - shape.segment.start.x, shape.segment.end.y - shape.segment.start.y))}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(event) => {
                              const length = Math.max(2, Number(event.target.value) || 2);
                              setWalls((prev) =>
                                prev.map((wall, wallIndex) => {
                                  if (wallIndex !== selectedIndex) return wall;
                                  const nextShapes = wall.shapes.map((candidate, index) => {
                                    if (index !== shapeIndex || candidate.type !== "segment" || !candidate.segment) return candidate;
                                    const dx = candidate.segment.end.x - candidate.segment.start.x;
                                    const dy = candidate.segment.end.y - candidate.segment.start.y;
                                    const currentLength = Math.hypot(dx, dy) || 1;
                                    const unitX = dx / currentLength;
                                    const unitY = dy / currentLength;
                                    const nextSegment = {
                                      ...candidate.segment,
                                      end: {
                                        x: candidate.segment.start.x + unitX * length,
                                        y: candidate.segment.start.y + unitY * length,
                                      },
                                    };
                                    return { ...candidate, segment: nextSegment, bounds: getWallBounds([{ ...candidate, segment: nextSegment }]) };
                                  });
                                  return { ...wall, shapes: nextShapes, bounds: getWallBounds(nextShapes) };
                                })
                              );
                            }}
                          />
                        </div>
                      )}
                      {shape.type === "polygon" && shape.points && shape.points.length >= 3 && (
                        <>
                          <div className="flex items-center gap-1">
                            <label className="text-[9px] text-zinc-600">W</label>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                              title="Width"
                              value={Math.round(pointsBounds(shape.points).width)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) => {
                                const width = Math.max(1, Number(event.target.value) || 1);
                                setWalls((prev) =>
                                  prev.map((wall, wallIndex) => {
                                    if (wallIndex !== selectedIndex) return wall;
                                    const nextShapes = wall.shapes.map((candidate, index) =>
                                      index === shapeIndex && candidate.type === "polygon" && candidate.points
                                        ? resizeWallPolygon(candidate, { width })
                                        : candidate
                                    );
                                    return { ...wall, shapes: nextShapes, bounds: getWallBounds(nextShapes) };
                                  })
                                );
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-[9px] text-zinc-600">H</label>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                              title="Height"
                              value={Math.round(pointsBounds(shape.points).height)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) => {
                                const height = Math.max(1, Number(event.target.value) || 1);
                                setWalls((prev) =>
                                  prev.map((wall, wallIndex) => {
                                    if (wallIndex !== selectedIndex) return wall;
                                    const nextShapes = wall.shapes.map((candidate, index) =>
                                      index === shapeIndex && candidate.type === "polygon" && candidate.points
                                        ? resizeWallPolygon(candidate, { height })
                                        : candidate
                                    );
                                    return { ...wall, shapes: nextShapes, bounds: getWallBounds(nextShapes) };
                                  })
                                );
                              }}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <label className="text-[9px] text-zinc-600">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                        </label>
                        <input
                          type="number"
                          step={5}
                          className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                          title="Rotation (degrees)"
                          placeholder="0"
                          value={shape.type === "segment" && shape.segment
                            ? Math.round(Math.atan2(shape.segment.end.y - shape.segment.start.y, shape.segment.end.x - shape.segment.start.x) * (180 / Math.PI))
                            : shape.rotation ?? 0}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(event) => {
                            const targetDeg = Number(event.target.value) || 0;
                            setWalls((prev) =>
                              prev.map((wall, wallIndex) => {
                                if (wallIndex !== selectedIndex) return wall;
                                const nextShapes = wall.shapes.map((candidate, index) => {
                                  if (index !== shapeIndex) return candidate;
                                  if (candidate.type === "segment" && candidate.segment) {
                                    return rotateSegmentTo(candidate, targetDeg);
                                  }
                                  return { ...candidate, rotation: targetDeg };
                                });
                                return { ...wall, shapes: nextShapes, bounds: getWallBounds(nextShapes) };
                              })
                            );
                          }}
                        />
                        <span className="text-[9px] text-zinc-600">deg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Copy + Delete wall */}
            <div className="pt-2">
              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/10 py-2 text-[11px] font-medium text-red-400/80 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
                onClick={() => onDelete(selectedIndex)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete wall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function patchWall(
  setWalls: React.Dispatch<React.SetStateAction<EditableWall[]>>,
  index: number,
  patch: Partial<EditableWall>
) {
  setWalls((prev) => prev.map((wall, wallIndex) => (wallIndex === index ? { ...wall, ...patch } : wall)));
}

const QUICK_PICK_COLORS = ["#8200DB", "#1447E6"] as const;

function resizeWallPolygon(shape: EditableShape, size: { width?: number; height?: number }) {
  if (shape.type !== "polygon" || !shape.points?.length) return shape;

  const bounds = pointsBounds(shape.points);
  const nextWidth = size.width ?? bounds.width;
  const nextHeight = size.height ?? bounds.height;
  const widthScale = bounds.width === 0 ? 1 : nextWidth / bounds.width;
  const heightScale = bounds.height === 0 ? 1 : nextHeight / bounds.height;

  const nextPoints = shape.points.map((point) => ({
    x: bounds.x + (point.x - bounds.x) * widthScale,
    y: bounds.y + (point.y - bounds.y) * heightScale,
  }));

  return {
    ...shape,
    points: nextPoints,
    bounds: pointsBounds(nextPoints),
  };
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <input
        className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-300">
      <input type="checkbox" className="accent-blue-500" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function getWallBounds(shapes: EditableWall["shapes"]) {
  const boxes = shapes
    .map((shape) => {
      if (shape.type === "segment" && shape.segment) {
        const points = segmentToPolygon(shape.segment);
        const minX = Math.min(...points.map((point) => point.x));
        const minY = Math.min(...points.map((point) => point.y));
        const maxX = Math.max(...points.map((point) => point.x));
        const maxY = Math.max(...points.map((point) => point.y));
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      }
      if (shape.bounds) return shape.bounds;
      if (!shape.points?.length) return null;

      const minX = Math.min(...shape.points.map((point) => point.x));
      const minY = Math.min(...shape.points.map((point) => point.y));
      const maxX = Math.max(...shape.points.map((point) => point.x));
      const maxY = Math.max(...shape.points.map((point) => point.y));
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  if (!boxes.length) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function pointsBounds(points: Array<{ x: number; y: number }>) {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function segmentToPolygon(segment: NonNullable<EditableWall["shapes"][number]["segment"]>) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (-dy / length) * (segment.thickness / 2);
  const offsetY = (dx / length) * (segment.thickness / 2);
  return [
    { x: segment.start.x + offsetX, y: segment.start.y + offsetY },
    { x: segment.end.x + offsetX, y: segment.end.y + offsetY },
    { x: segment.end.x - offsetX, y: segment.end.y - offsetY },
    { x: segment.start.x - offsetX, y: segment.start.y - offsetY },
  ];
}

function rotateSegmentTo(shape: EditableShape, targetDeg: number): EditableShape {
  if (!shape.segment) return shape;
  const seg = shape.segment;
  const cx = (seg.start.x + seg.end.x) / 2;
  const cy = (seg.start.y + seg.end.y) / 2;
  const halfLen = Math.hypot(seg.end.x - seg.start.x, seg.end.y - seg.start.y) / 2;
  const rad = (targetDeg * Math.PI) / 180;
  const newStart = { x: cx - Math.cos(rad) * halfLen, y: cy - Math.sin(rad) * halfLen };
  const newEnd = { x: cx + Math.cos(rad) * halfLen, y: cy + Math.sin(rad) * halfLen };
  const newSegment = { ...seg, start: newStart, end: newEnd };
  return { ...shape, rotation: undefined, segment: newSegment };
}
