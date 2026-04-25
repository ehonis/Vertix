"use client";

import React from "react";
import type { EditableFeature, EditableLabel, EditableWall } from "./MapEditorShell";

type LabelPanelProps = {
  labels: EditableLabel[];
  setLabels: React.Dispatch<React.SetStateAction<EditableLabel[]>>;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  walls: EditableWall[];
  features: EditableFeature[];
};

export function LabelPanel({ labels, setLabels, selectedIndex, setSelectedIndex, walls, features }: LabelPanelProps) {
  const selected = selectedIndex !== null ? labels[selectedIndex] : null;
  const backgroundQuickPicks = React.useMemo(() => {
    const values = [
      ...walls.map((wall) => wall.fillColor).filter(Boolean),
      ...features.flatMap((feature) => {
        if (feature.type === "overhang") {
          return [feature.patternColor, feature.strokeColor].filter(Boolean);
        }
        return [feature.fillColor, feature.strokeColor].filter(Boolean);
      }),
    ];

    return Array.from(new Set(values));
  }, [walls, features]);

  return (
    <div className="flex flex-col text-white">
      {/* ── Label list section ────────────────────────────────── */}
      <div className="border-b border-white/[0.06] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Labels
          </h3>
          <button
            className="flex h-6 items-center gap-1 rounded-md border border-dashed border-white/[0.1] px-2 text-[11px] font-medium text-zinc-400 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400"
            onClick={() => {
              setLabels((prev) => [...prev, {
                id: `label-${prev.length + 1}`,
                x: 40,
                y: 40,
                text: `Label ${prev.length + 1}`,
                fontSize: 12,
                padding: 4,
                rotation: 0,
                fill: "#FFFFFF",
                backgroundColor: "#000000",
                backgroundOpacity: 0.75,
                outlineColor: "#FFFFFF",
                outlineOpacity: 0,
              }]);
              setSelectedIndex(labels.length);
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
        </div>

        {labels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4h16v3" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
            </div>
            <p className="text-[12px] text-zinc-500">No labels yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {labels.map((label, index) => (
              <button
                key={label.id}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  index === selectedIndex ? "bg-blue-500/10 ring-1 ring-blue-500/30" : "hover:bg-white/[0.04]"
                }`}
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
              >
                <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: label.backgroundColor }} />
                <span className="flex-1 truncate text-[12px] font-medium">{label.text}</span>
                <span className="font-mono text-[10px] tabular-nums text-zinc-500">{Math.round(label.x)},{Math.round(label.y)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Label detail section ──────────────────────────────── */}
      {selected && selectedIndex !== null && (
        <div className="flex flex-col">
          <div className="space-y-3 border-b border-white/[0.06] p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Properties</h3>

            <Field label="Text" value={selected.text} onChange={(v) => patch(setLabels, selectedIndex, { text: v })} />

            <div className="grid grid-cols-3 gap-2">
              <NumberField label="X" value={selected.x} onChange={(v) => patch(setLabels, selectedIndex, { x: v })} />
              <NumberField label="Y" value={selected.y} onChange={(v) => patch(setLabels, selectedIndex, { y: v })} />
              <NumberField label="Size" value={selected.fontSize} onChange={(v) => patch(setLabels, selectedIndex, { fontSize: v })} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberField label="Padding" value={selected.padding} onChange={(v) => patch(setLabels, selectedIndex, { padding: Math.max(0, v) })} />
              <NumberField label="Rotation" value={selected.rotation} onChange={(v) => patch(setLabels, selectedIndex, { rotation: v })} />
            </div>
          </div>

          <div className="space-y-3 p-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Colors</h3>

            <div className="flex items-end gap-4">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Text</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-8 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent" value={selected.fill} onChange={(e) => patch(setLabels, selectedIndex, { fill: e.target.value })} />
                  <span className="font-mono text-[11px] text-zinc-400">{selected.fill}</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-8 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent" value={selected.backgroundColor} onChange={(e) => patch(setLabels, selectedIndex, { backgroundColor: e.target.value })} />
                  <span className="font-mono text-[11px] text-zinc-400">{selected.backgroundColor}</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Outline</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-8 cursor-pointer rounded-lg border border-white/[0.08] bg-transparent" value={selected.outlineColor} onChange={(e) => patch(setLabels, selectedIndex, { outlineColor: e.target.value })} />
                  <span className="font-mono text-[11px] text-zinc-400">{selected.outlineColor}</span>
                </div>
              </div>
            </div>

            {backgroundQuickPicks.length > 0 && (
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Background Quick Picks</label>
                <div className="flex flex-wrap items-center gap-2">
                  {backgroundQuickPicks.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-6 w-6 rounded-md border transition ${selected.backgroundColor === color ? "border-white ring-1 ring-white/50" : "border-white/[0.08] hover:border-white/25"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => patch(setLabels, selectedIndex, { backgroundColor: color })}
                      aria-label={`Use ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <RangeField
                label="Background Opacity"
                value={selected.backgroundOpacity}
                onChange={(value) => patch(setLabels, selectedIndex, { backgroundOpacity: value })}
              />
              <RangeField
                label="Outline Opacity"
                value={selected.outlineOpacity}
                onChange={(value) => patch(setLabels, selectedIndex, { outlineOpacity: value })}
              />
            </div>

            {/* Delete label */}
            <div className="pt-2">
              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/10 py-2 text-[11px] font-medium text-red-400/80 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
                onClick={() => { setLabels((prev) => prev.filter((_, i) => i !== selectedIndex)); setSelectedIndex(null); }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function patch(set: React.Dispatch<React.SetStateAction<EditableLabel[]>>, index: number, p: Partial<EditableLabel>) {
  set((prev) => prev.map((l, i) => (i === index ? { ...l, ...p } : l)));
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <input className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <input type="number" className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] tabular-nums text-zinc-300 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <div className="flex items-center gap-2">
        <input type="range" min={0} max={1} step={0.05} className="h-8 w-full accent-blue-500" value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <span className="w-10 text-right text-[10px] tabular-nums text-zinc-500">{Math.round(value * 100)}%</span>
      </div>
    </div>
  );
}
