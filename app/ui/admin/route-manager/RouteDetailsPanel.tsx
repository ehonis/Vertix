"use client";
import clsx from "clsx";
import { ROUTE_COLORS, BOULDER_GRADES, ROPE_GRADES, displayGrade } from "./constants";
import type { WallPartKey } from "@/lib/wallLocations";
import { wallPartLabel } from "@/lib/wallLocations";
import { routeTypeForWall } from "./snap";

export type DetailsDraft = {
  title: string;
  color: string;
  grade: string;
  wallPart: WallPartKey | null;
};

type Props = {
  mode: "create" | "edit";
  draft: DetailsDraft;
  onChange: (next: DetailsDraft) => void;
  onPrimary: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
};

export default function RouteDetailsPanel({
  mode,
  draft,
  onChange,
  onPrimary,
  onCancel,
  onDelete,
  primaryDisabled,
  primaryLoading,
}: Props) {
  const type = routeTypeForWall(draft.wallPart);
  const grades = type === "BOULDER" ? BOULDER_GRADES : ROPE_GRADES;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {mode === "create" ? "New route" : "Edit route"}
          </p>
          <h2 className="mt-0.5 text-[14px] font-semibold tracking-tight text-zinc-100">
            {mode === "create"
              ? "Drag the dot to place"
              : draft.title || "Unnamed route"}
          </h2>
        </div>
        <span
          className={clsx(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
            type === "BOULDER"
              ? "border-purple-400/30 bg-purple-400/10 text-purple-300"
              : "border-blue-400/30 bg-blue-400/10 text-blue-300",
          )}
        >
          {type === "BOULDER" ? "Boulder" : "Rope"}
        </span>
      </div>

      {/* Wall location */}
      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Wall
        </label>
        <div className="flex h-8 w-full items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] font-medium text-zinc-300">
          {draft.wallPart ? wallPartLabel(draft.wallPart) : (
            <span className="text-zinc-600">Drag onto a wall...</span>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Name <span className="normal-case text-zinc-600">(optional)</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={e => onChange({ ...draft, title: e.target.value })}
          placeholder="Crimp city"
          className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] font-medium text-zinc-100 placeholder:text-zinc-600 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      {/* Color */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Color
        </label>
        <div className="grid grid-cols-6 gap-1.5">
          {ROUTE_COLORS.map(c => {
            const active = c.id === draft.color;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ ...draft, color: c.id })}
                className={clsx(
                  "group relative aspect-square rounded-lg border transition",
                  active
                    ? "border-white/60 ring-2 ring-white/10"
                    : "border-white/[0.08] hover:border-white/25",
                )}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.id === "black" || c.id === "brown" ? "#fff" : "#000"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                {c.id === "white" && !active && (
                  <span className="absolute inset-0 rounded-lg border border-black/20" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Grade
        </label>
        <div className="flex flex-wrap gap-1">
          {grades.map(g => {
            const active = g === draft.grade;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...draft, grade: g })}
                className={clsx(
                  "rounded-md border px-2 py-1 font-mono text-[11px] transition",
                  active
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-200"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/15 hover:text-zinc-300",
                )}
              >
                {displayGrade(g)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 items-center rounded-lg border border-red-500/20 bg-red-500/5 px-3 text-[11px] font-medium text-red-300 transition hover:border-red-500/40 hover:bg-red-500/10"
          >
            Archive
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
        >
          {mode === "edit" ? "Deselect" : "Cancel"}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled || primaryLoading}
          className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-40 disabled:shadow-none"
        >
          {primaryLoading ? (
            <>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Saving...
            </>
          ) : mode === "create" ? (
            "Place route"
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}
