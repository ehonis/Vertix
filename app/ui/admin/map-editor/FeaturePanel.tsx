"use client";

import React from "react";
import type { EditableFeature, EditableShape } from "./MapEditorShell";

const QUICK_PICK_COLORS = ["#8200DB", "#1447E6"] as const;

type FeaturePanelProps = {
  features: EditableFeature[];
  setFeatures: React.Dispatch<React.SetStateAction<EditableFeature[]>>;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  selectedShapeIndex: number | null;
  setSelectedShapeIndex: (index: number | null) => void;
  drawingMode: "none" | "segment" | "polygon" | "triangle";
  setDrawingMode: (mode: "none" | "segment" | "polygon" | "triangle") => void;
  setDrawingTarget: (target: { type: "feature"; featureIndex: number } | null) => void;
  onCopyShape: (owner: "wall" | "feature", ownerIndex: number, shapeIndex: number) => void;
  onPasteShape: () => void;
  hasClipboard: boolean;
};

export function FeaturePanel({
  features,
  setFeatures,
  selectedIndex,
  setSelectedIndex,
  drawingMode,
  setDrawingMode,
  setDrawingTarget,
  selectedShapeIndex,
  setSelectedShapeIndex,
  onCopyShape,
  onPasteShape,
  hasClipboard,
}: FeaturePanelProps) {
  const selected = selectedIndex !== null ? features[selectedIndex] : null;

  return (
    <div className="flex flex-col text-white">
      {/* ── Feature list section ──────────────────────────────── */}
      <div className="border-b border-white/[0.06] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Features
          </h3>
          <button
            className="flex h-6 items-center gap-1 rounded-md border border-dashed border-white/[0.1] px-2 text-[11px] font-medium text-zinc-400 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400"
            onClick={() => {
              setFeatures((prev) => [
                ...prev,
                { id: `feature-${prev.length + 1}`, type: "non_climbing_area", name: `Feature ${prev.length + 1}`, allowOverflow: false, fillColor: "#6B7280", fillOpacity: 1, strokeColor: "#6B7280", strokeWidth: 0, shapes: [] },
              ]);
              setSelectedIndex(features.length);
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
        </div>

        {features.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
            </div>
            <p className="text-[12px] text-zinc-500">No features yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  index === selectedIndex ? "bg-blue-500/10 ring-1 ring-blue-500/30" : "hover:bg-white/[0.04]"
                }`}
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded ${feature.type === "overhang" ? "border-2 border-zinc-400" : ""}`}
                  style={{ backgroundColor: feature.type === "overhang" ? "transparent" : feature.type === "mat" ? (feature.fillColor ?? "#3F3F46") : (feature.fillColor ?? "#6B7280") }}
                />
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[12px] font-medium leading-tight">{feature.name}</span>
                </div>
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                  feature.type === "overhang" ? "bg-amber-500/10 text-amber-400" : feature.type === "mat" ? "bg-blue-500/10 text-blue-400" : "bg-zinc-500/10 text-zinc-400"
                }`}>
                  {feature.type === "overhang" ? "OH" : feature.type === "mat" ? "MAT" : "NCA"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Feature detail section ────────────────────────────── */}
      {selected && selectedIndex !== null && (
        <div className="flex flex-col">
          {/* Properties */}
          <div className="space-y-3 border-b border-white/[0.06] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Properties</h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Name</label>
                <input
                  className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  value={selected.name}
                  onChange={(e) => patch(setFeatures, selectedIndex, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Type</label>
                <select
                  className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[12px] text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  value={selected.type}
                  onChange={(e) => patch(setFeatures, selectedIndex, { type: e.target.value as EditableFeature["type"] })}
                >
                  <option value="non_climbing_area">Non-climbing</option>
                  <option value="overhang">Overhang</option>
                  <option value="mat">Mat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {selected.type === "overhang" ? "Pattern color" : "Fill color"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent"
                  value={(selected.type === "overhang" ? selected.patternColor : selected.fillColor) ?? (selected.type === "mat" ? "#3F3F46" : "#6B7280")}
                  onChange={(e) => patch(setFeatures, selectedIndex, selected.type === "overhang" ? { patternColor: e.target.value } : { fillColor: e.target.value })}
                />
                <span className="font-mono text-[11px] text-zinc-400">
                  {(selected.type === "overhang" ? selected.patternColor : selected.fillColor) ?? (selected.type === "mat" ? "#3F3F46" : "#6B7280")}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {QUICK_PICK_COLORS.map((color) => {
                  const currentColor = (selected.type === "overhang" ? selected.patternColor : selected.fillColor) ?? (selected.type === "mat" ? "#3F3F46" : "#6B7280");
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`h-6 w-6 rounded-md border transition ${currentColor === color ? "border-white ring-1 ring-white/50" : "border-white/[0.08] hover:border-white/25"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => patch(setFeatures, selectedIndex, selected.type === "overhang" ? { patternColor: color } : { fillColor: color })}
                      aria-label={`Use ${color}`}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Opacity */}
            {selected.type !== "overhang" && (
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Opacity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0} max={1} step={0.05}
                    className="h-8 w-24 accent-blue-500"
                    value={selected.fillOpacity ?? 0.35}
                    onChange={(e) => patch(setFeatures, selectedIndex, { fillOpacity: Number(e.target.value) })}
                  />
                  <span className="text-[10px] tabular-nums text-zinc-500">{Math.round((selected.fillOpacity ?? 0.35) * 100)}%</span>
                </div>
              </div>
            )}

            {/* Outline */}
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Outline</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent"
                  value={selected.strokeColor ?? (selected.type === "overhang" ? "#4B5563" : "#6B7280")}
                  onChange={(e) => patch(setFeatures, selectedIndex, { strokeColor: e.target.value })}
                />
                <input
                  type="number"
                  min={0} max={10} step={0.5}
                  className="h-8 w-14 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-center text-[11px] tabular-nums text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50"
                  placeholder="0"
                  value={selected.strokeWidth ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    patch(setFeatures, selectedIndex, { strokeWidth: v });
                  }}
                />
                <span className="text-[9px] text-zinc-600">px</span>
                {selected.strokeColor && (
                  <button
                    className="rounded px-1.5 py-0.5 text-[9px] text-zinc-500 transition hover:bg-white/[0.06] hover:text-red-400"
                    onClick={() => patch(setFeatures, selectedIndex, { strokeColor: undefined, strokeWidth: undefined })}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckField
                label="Allow Overflow"
                checked={selected.allowOverflow}
                onChange={(value) => patch(setFeatures, selectedIndex, { allowOverflow: value })}
              />
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
                  onClick={() => { setDrawingTarget({ type: "feature", featureIndex: selectedIndex }); setDrawingMode(mode); }}
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
                  setDrawingTarget({ type: "feature", featureIndex: selectedIndex });
                  setDrawingMode("triangle");
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L22 21H2z"/></svg>
                Triangle
              </button>
            </div>
          </div>

          {/* Shapes list */}
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Shapes</h3>
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
                <span className="text-[10px] tabular-nums text-zinc-600">{selected.shapes.length}</span>
              </div>
            </div>

            {selected.shapes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/[0.06] py-5">
                <p className="text-[11px] text-zinc-500">No shapes yet</p>
                <p className="text-[10px] text-zinc-600">Use the drawing tools above</p>
              </div>
            ) : (
              <div className="space-y-1">
                {selected.shapes.map((shape, shapeIndex) => (
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
                          onCopyShape("feature", selectedIndex, shapeIndex);
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button
                        className="rounded-md px-1.5 py-0.5 text-[10px] text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeatures((prev) => prev.map((f, fi) => {
                            if (fi !== selectedIndex) return f;
                            const next = f.shapes.filter((_, i) => i !== shapeIndex);
                            return { ...f, shapes: next, bounds: next.length ? getBounds(next) : undefined };
                          }));
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                    {/* Inline edit fields */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {selected.type === "overhang" && getOverhangEdgeOptions(shape).length > 0 && (
                        <div className="flex items-center gap-1">
                          {getOverhangEdgeOptions(shape).map(({ key, label }) => {
                            const hiddenEdges = shape.attributes?.hiddenEdges?.split(",").filter(Boolean) ?? [];
                            const isHidden = hiddenEdges.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition ${isHidden ? "bg-white/[0.04] text-zinc-600" : "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.12]"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeatures((prev) => prev.map((f, fi) => {
                                    if (fi !== selectedIndex) return f;
                                    const nextShapes = f.shapes.map((s, si) => {
                                      if (si !== shapeIndex) return s;
                                      const currentHidden = s.attributes?.hiddenEdges?.split(",").filter(Boolean) ?? [];
                                      const nextHidden = currentHidden.includes(key)
                                        ? currentHidden.filter((value) => value !== key)
                                        : [...currentHidden, key];
                                      return {
                                        ...s,
                                        attributes: {
                                          ...s.attributes,
                                          hiddenEdges: nextHidden.join(","),
                                        },
                                      };
                                    });
                                    return { ...f, shapes: nextShapes, bounds: getBounds(nextShapes) };
                                  }));
                                }}
                                title={`${isHidden ? "Show" : "Hide"} ${label.toLowerCase()} side`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {shape.type === "segment" && shape.segment && (
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-zinc-600">W</label>
                          <input
                            type="number" min={4} step={1}
                            className="h-5 w-12 rounded border border-white/[0.08] bg-white/[0.04] px-1 text-center text-[10px] tabular-nums text-zinc-300 outline-none transition focus:border-blue-500/50"
                            value={shape.segment.thickness}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const thickness = Math.max(4, Number(e.target.value) || 4);
                              setFeatures((prev) => prev.map((f, fi) => {
                                if (fi !== selectedIndex) return f;
                                const nextShapes = f.shapes.map((s, si) => si === shapeIndex && s.type === "segment" && s.segment ? { ...s, segment: { ...s.segment, thickness } } : s);
                                return { ...f, shapes: nextShapes, bounds: getBounds(nextShapes) };
                              }));
                            }}
                          />
                        </div>
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
                          onChange={(e) => {
                            const targetDeg = Number(e.target.value) || 0;
                            setFeatures((prev) => prev.map((f, fi) => {
                              if (fi !== selectedIndex) return f;
                              const nextShapes = f.shapes.map((s, si) => {
                                if (si !== shapeIndex) return s;
                                if (s.type === "segment" && s.segment) return rotateSegmentTo(s, targetDeg);
                                return { ...s, rotation: targetDeg };
                              });
                              return { ...f, shapes: nextShapes, bounds: getBounds(nextShapes) };
                            }));
                          }}
                        />
                        <span className="text-[9px] text-zinc-600">deg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Copy + Delete feature */}
            <div className="pt-2">
              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/10 py-2 text-[11px] font-medium text-red-400/80 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
                onClick={() => { setFeatures((prev) => prev.filter((_, i) => i !== selectedIndex)); setSelectedIndex(null); }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete feature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getOverhangEdgeOptions(shape: EditableShape) {
  if (shape.type === "segment" && shape.segment) {
    return [
      { key: "top", label: "Top" },
      { key: "right", label: "Right" },
      { key: "bottom", label: "Bottom" },
      { key: "left", label: "Left" },
    ];
  }

  if (shape.type === "polygon" && shape.points?.length) {
    if (shape.points.length === 4) {
      return [
        { key: "top", label: "Top" },
        { key: "right", label: "Right" },
        { key: "bottom", label: "Bottom" },
        { key: "left", label: "Left" },
      ];
    }

    return shape.points.map((_, index) => ({
      key: `edge-${index}`,
      label: `E${index + 1}`,
    }));
  }

  return [];
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-300">
      <input type="checkbox" className="accent-blue-500" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function patch(set: React.Dispatch<React.SetStateAction<EditableFeature[]>>, index: number, p: Partial<EditableFeature>) {
  set((prev) => prev.map((f, i) => (i === index ? { ...f, ...p } : f)));
}

function getBounds(shapes: EditableFeature["shapes"]) {
  const boxes = shapes.map((s) => {
    if (s.type === "segment" && s.segment) {
      const dx = s.segment.end.x - s.segment.start.x, dy = s.segment.end.y - s.segment.start.y;
      const len = Math.hypot(dx, dy) || 1, ox = (-dy / len) * (s.segment.thickness / 2), oy = (dx / len) * (s.segment.thickness / 2);
      const pts = [{ x: s.segment.start.x + ox, y: s.segment.start.y + oy }, { x: s.segment.end.x + ox, y: s.segment.end.y + oy }, { x: s.segment.end.x - ox, y: s.segment.end.y - oy }, { x: s.segment.start.x - ox, y: s.segment.start.y - oy }];
      return { x: Math.min(...pts.map(p => p.x)), y: Math.min(...pts.map(p => p.y)), width: Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x)), height: Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y)) };
    }
    if (s.bounds) return s.bounds;
    if (!s.points?.length) return null;
    return { x: Math.min(...s.points.map(p => p.x)), y: Math.min(...s.points.map(p => p.y)), width: Math.max(...s.points.map(p => p.x)) - Math.min(...s.points.map(p => p.x)), height: Math.max(...s.points.map(p => p.y)) - Math.min(...s.points.map(p => p.y)) };
  }).filter((v): v is NonNullable<typeof v> => v !== null);
  if (!boxes.length) return undefined;
  return { x: Math.min(...boxes.map(b => b.x)), y: Math.min(...boxes.map(b => b.y)), width: Math.max(...boxes.map(b => b.x + b.width)) - Math.min(...boxes.map(b => b.x)), height: Math.max(...boxes.map(b => b.y + b.height)) - Math.min(...boxes.map(b => b.y)) };
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
