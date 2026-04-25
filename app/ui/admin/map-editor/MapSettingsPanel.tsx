"use client";

import React from "react";
import type { MapSettings } from "./MapEditorShell";

type MapSettingsPanelProps = {
  settings: MapSettings;
  setSettings: React.Dispatch<React.SetStateAction<MapSettings>>;
};

export function MapSettingsPanel({ settings, setSettings }: MapSettingsPanelProps) {
  const set = (patch: Partial<MapSettings>) => setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col text-white">
      <div className="space-y-3 border-b border-white/[0.06] p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">General</h3>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Key" value={settings.key} onChange={(v) => set({ key: v })} />
          <Field label="Name" value={settings.name} onChange={(v) => set({ name: v })} />
        </div>

        <Field label="SVG ViewBox" value={settings.svgView} onChange={(v) => set({ svgView: v })} />
      </div>

      <div className="space-y-3 border-b border-white/[0.06] p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Display</h3>

        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Width" value={settings.displayWidth} onChange={(v) => set({ displayWidth: v })} />
          <NumberField label="Height" value={settings.displayHeight} onChange={(v) => set({ displayHeight: v })} />
        </div>
      </div>

      <div className="p-3">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Status</h3>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-zinc-300 transition hover:bg-white/[0.04]">
          <input type="checkbox" className="accent-blue-500" checked={settings.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
          <div className="flex flex-col">
            <span className="font-medium">Active map</span>
            <span className="text-[10px] text-zinc-500">Enable this map for display</span>
          </div>
        </label>
      </div>
    </div>
  );
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
