"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MapCanvas } from "./MapCanvas";
import { WallPanel } from "./WallPanel";
import { FeaturePanel } from "./FeaturePanel";
import { LabelPanel } from "./LabelPanel";
import { MapSettingsPanel } from "./MapSettingsPanel";

type EditorTab = "walls" | "features" | "labels" | "settings";

// Types for local editable state
export type EditableShape = {
  id: string;
  type: "segment" | "polygon" | "path";
  bounds?: { x: number; y: number; width: number; height: number };
  transform?: { value: string };
  rotation?: number; // degrees, rotates around shape center
  points?: { x: number; y: number }[];
  segment?: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    thickness: number;
  };
  pathData?: string;
  label?: string;
  className?: string;
  style?: Record<string, string>;
  attributes?: Record<string, string>;
  children?: string[];
};

export type EditableWall = {
  _id?: Id<"gymWalls">;
  gymZoneId: Id<"gymZones"> | "";
  slug: string;
  name: string;
  partKey: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor?: string;
  strokeWidth?: number;
  bounds: { x: number; y: number; width: number; height: number };
  shapes: EditableShape[];
  isInteractive: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type EditableFeature = {
  id: string;
  type: "non_climbing_area" | "overhang" | "mat";
  name: string;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  patternColor?: string;
  patternOpacity?: number;
  bounds?: { x: number; y: number; width: number; height: number };
  shapes: EditableShape[];
};

export type EditableLabel = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  backgroundColor: string;
  backgroundOpacity: number;
};

export type MapSettings = {
  key: string;
  name: string;
  svgView: string;
  displayWidth: number;
  displayHeight: number;
  isActive: boolean;
};

export type ClipboardItem = {
  shape: EditableShape;
  /** Style context from the parent wall/feature so paste can optionally apply styling */
  style?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
  };
} | null;

export function MapEditorShell() {
  // Gym / area selection
  const [selectedGymId, setSelectedGymId] = useState<Id<"gyms"> | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<Id<"gymAreas"> | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>("walls");

  // Local editable state
  const [walls, setWalls] = useState<EditableWall[]>([]);
  const [features, setFeatures] = useState<EditableFeature[]>([]);
  const [labels, setLabels] = useState<EditableLabel[]>([]);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    key: "main",
    name: "Main Map",
    svgView: "0 0 300 250",
    displayWidth: 330,
    displayHeight: 290,
    isActive: true,
  });
  const [mapId, setMapId] = useState<Id<"gymAreaMaps"> | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null);
  const [selectedLabelIndex, setSelectedLabelIndex] = useState<number | null>(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<"none" | "segment" | "polygon" | "triangle">("none");
  const [drawingTarget, setDrawingTarget] = useState<
    | { type: "wall"; wallIndex: number }
    | { type: "feature"; featureIndex: number }
    | null
  >(null);

  // Clipboard for copy/paste (operates on individual shapes)
  const [clipboard, setClipboard] = useState<ClipboardItem>(null);

  // Copy the currently selected shape from its parent wall or feature
  const handleCopy = useCallback(() => {
    if (selectedShapeIndex === null) return false;

    if (selectedWallIndex !== null && walls[selectedWallIndex]) {
      const wall = walls[selectedWallIndex];
      const shape = wall.shapes[selectedShapeIndex];
      if (!shape) return false;
      setClipboard({
        shape: structuredClone(shape),
        style: {
          fillColor: wall.fillColor,
          fillOpacity: wall.fillOpacity,
          strokeColor: wall.strokeColor,
          strokeWidth: wall.strokeWidth,
        },
      });
      return true;
    }
    if (selectedFeatureIndex !== null && features[selectedFeatureIndex]) {
      const feature = features[selectedFeatureIndex];
      const shape = feature.shapes[selectedShapeIndex];
      if (!shape) return false;
      setClipboard({
        shape: structuredClone(shape),
        style: {
          fillColor: feature.fillColor,
          fillOpacity: feature.fillOpacity,
          strokeColor: feature.strokeColor,
          strokeWidth: feature.strokeWidth,
        },
      });
      return true;
    }
    return false;
  }, [selectedShapeIndex, selectedWallIndex, selectedFeatureIndex, walls, features]);

  // Copy a specific shape by index from a specific owner (for button clicks)
  const handleCopyShapeAt = useCallback((owner: "wall" | "feature", ownerIndex: number, shapeIndex: number) => {
    if (owner === "wall" && walls[ownerIndex]) {
      const wall = walls[ownerIndex];
      const shape = wall.shapes[shapeIndex];
      if (!shape) return;
      setClipboard({
        shape: structuredClone(shape),
        style: {
          fillColor: wall.fillColor,
          fillOpacity: wall.fillOpacity,
          strokeColor: wall.strokeColor,
          strokeWidth: wall.strokeWidth,
        },
      });
    } else if (owner === "feature" && features[ownerIndex]) {
      const feature = features[ownerIndex];
      const shape = feature.shapes[shapeIndex];
      if (!shape) return;
      setClipboard({
        shape: structuredClone(shape),
        style: {
          fillColor: feature.fillColor,
          fillOpacity: feature.fillOpacity,
          strokeColor: feature.strokeColor,
          strokeWidth: feature.strokeWidth,
        },
      });
    }
  }, [walls, features]);

  // Paste the copied shape into the currently selected wall or feature
  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    const PASTE_OFFSET = 15;
    const newShape = offsetShape(structuredClone(clipboard.shape), PASTE_OFFSET);

    if (selectedWallIndex !== null && walls[selectedWallIndex]) {
      setWalls((prev) =>
        prev.map((wall, i) => {
          if (i !== selectedWallIndex) return wall;
          const shapes = [...wall.shapes, newShape];
          return { ...wall, shapes, bounds: getCombinedBoundsShell(shapes) };
        })
      );
      setSelectedShapeIndex(walls[selectedWallIndex].shapes.length);
      return;
    }
    if (selectedFeatureIndex !== null && features[selectedFeatureIndex]) {
      setFeatures((prev) =>
        prev.map((f, i) => {
          if (i !== selectedFeatureIndex) return f;
          const shapes = [...f.shapes, newShape];
          return { ...f, shapes, bounds: getCombinedBoundsShell(shapes) };
        })
      );
      setSelectedShapeIndex(features[selectedFeatureIndex].shapes.length);
      return;
    }
  }, [clipboard, selectedWallIndex, selectedFeatureIndex, walls, features, setWalls, setFeatures]);

  // Keyboard shortcuts: Ctrl/Cmd+C to copy, Ctrl/Cmd+V to paste
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // Don't intercept if user is typing in an input/select/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "c") {
        if (handleCopy()) {
          e.preventDefault();
        }
      }
      if (e.key === "v") {
        if (clipboard) {
          e.preventDefault();
          handlePaste();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCopy, handlePaste, clipboard]);

  // Convex queries
  const gyms = useQuery(api.mapEditor.listGyms, {});
  const areas = useQuery(
    api.mapEditor.listAreasForGym,
    selectedGymId ? { gymId: selectedGymId } : "skip"
  );
  const zones = useQuery(
    api.mapEditor.listZonesForArea,
    selectedAreaId ? { gymAreaId: selectedAreaId } : "skip"
  );
  const existingMap = useQuery(
    api.mapEditor.getAreaMap,
    selectedAreaId ? { gymAreaId: selectedAreaId } : "skip"
  );
  const existingWalls = useQuery(
    api.mapEditor.listWallsForArea,
    selectedAreaId ? { gymAreaId: selectedAreaId } : "skip"
  );

  // Convex mutations
  const upsertAreaMap = useMutation(api.mapEditor.upsertAreaMap);
  const upsertWall = useMutation(api.mapEditor.upsertWall);
  const deleteWallMut = useMutation(api.mapEditor.deleteWall);
  const createArea = useMutation(api.mapEditor.createArea);
  const createZone = useMutation(api.mapEditor.createZone);

  // Load data from DB when area is selected
  const loadFromDb = useCallback(() => {
    if (existingMap) {
      setMapSettings({
        key: existingMap.key,
        name: existingMap.name,
        svgView: existingMap.svgView,
        displayWidth: existingMap.displayWidth ?? 330,
        displayHeight: existingMap.displayHeight ?? 290,
        isActive: existingMap.isActive,
      });
      setMapId(existingMap._id);
      setLabels(
        existingMap.labels.map((l) => ({
          id: l.id,
          x: l.x,
          y: l.y,
          text: l.text,
          fontSize: l.fontSize ?? 12,
          fill: l.fill ?? "#FFFFFF",
          backgroundColor: l.backgroundColor ?? "#000000",
          backgroundOpacity: l.backgroundOpacity ?? 0.75,
        }))
      );
      setFeatures([
        ...existingMap.nonClimbingFeatures.map((f) => ({
          id: f.id,
          type: "non_climbing_area" as const,
          name: f.name ?? "",
          fillColor: f.fillColor,
          fillOpacity: f.fillOpacity,
          strokeColor: f.strokeColor,
          strokeWidth: f.strokeWidth,
          bounds: f.bounds,
          shapes: f.shapes.map(shapeDocToEditable),
        })),
        ...existingMap.overhangFeatures.map((f) => ({
          id: f.id,
          type: "overhang" as const,
          name: f.name ?? "",
          patternColor: f.patternColor,
          patternOpacity: f.patternOpacity,
          strokeColor: f.strokeColor,
          strokeWidth: f.strokeWidth,
          bounds: f.bounds,
          shapes: f.shapes.map(shapeDocToEditable),
        })),
        ...(existingMap.matFeatures ?? []).map((f) => ({
          id: f.id,
          type: "mat" as const,
          name: f.name ?? "",
          fillColor: f.fillColor,
          fillOpacity: f.fillOpacity,
          strokeColor: f.strokeColor,
          strokeWidth: f.strokeWidth,
          bounds: f.bounds,
          shapes: f.shapes.map(shapeDocToEditable),
        })),
      ]);
    } else {
      setMapId(null);
    }

    if (existingWalls) {
      setWalls(
        existingWalls.map((w) => ({
          _id: w._id,
          gymZoneId: w.gymZoneId,
          slug: w.slug,
          name: w.name,
          partKey: w.partKey,
          fillColor: w.fillColor ?? "#1447E6",
          fillOpacity: 0.9,
          strokeColor: w.strokeColor,
          strokeWidth: w.strokeWidth,
          bounds: w.bounds ?? { x: 0, y: 0, width: 50, height: 50 },
          shapes: w.shapes.map(shapeDocToEditable),
          isInteractive: w.isInteractive,
          isActive: w.isActive,
          sortOrder: w.sortOrder ?? 0,
        }))
      );
    }
  }, [existingMap, existingWalls]);

  // Auto-load when data arrives
  React.useEffect(() => {
    if (selectedAreaId && (existingMap !== undefined || existingWalls !== undefined)) {
      loadFromDb();
    }
  }, [selectedAreaId, existingMap, existingWalls, loadFromDb]);

  // SVG viewbox parsing
  const viewBox = useMemo(() => {
    const parts = mapSettings.svgView.split(/\s+/).map(Number);
    return {
      minX: parts[0] ?? 0,
      minY: parts[1] ?? 0,
      width: parts[2] ?? 300,
      height: parts[3] ?? 250,
    };
  }, [mapSettings.svgView]);

  // Save all data to DB
  const handleSave = useCallback(async () => {
    if (!selectedGymId || !selectedAreaId) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Save the area map
      const nonClimbingFeatures = features
        .filter((f) => f.type === "non_climbing_area")
        .map(featureToDoc);
      const overhangFeatures = features
        .filter((f) => f.type === "overhang")
        .map(featureToDoc);
      const matFeatures = features
        .filter((f) => f.type === "mat")
        .map(featureToDoc);

      const newMapId = await upsertAreaMap({
        id: mapId ?? undefined,
        gymId: selectedGymId,
        gymAreaId: selectedAreaId,
        key: mapSettings.key,
        name: mapSettings.name,
        svgView: mapSettings.svgView,
        displayWidth: mapSettings.displayWidth,
        displayHeight: mapSettings.displayHeight,
        nonClimbingFeatures,
        overhangFeatures,
        matFeatures: matFeatures.length > 0 ? matFeatures : undefined,
        labels: labels.map((l) => ({
          id: l.id,
          x: l.x,
          y: l.y,
          text: l.text,
          fontSize: l.fontSize,
          fill: l.fill,
          backgroundColor: l.backgroundColor,
          backgroundOpacity: l.backgroundOpacity,
        })),
        isActive: mapSettings.isActive,
      });
      setMapId(newMapId);

      // Save walls
      for (const wall of walls) {
        if (!wall.gymZoneId) continue;
        await upsertWall({
          id: wall._id ?? undefined,
          gymId: selectedGymId,
          gymAreaId: selectedAreaId,
          gymZoneId: wall.gymZoneId as Id<"gymZones">,
          slug: wall.slug,
          name: wall.name,
          partKey: wall.partKey,
          fillColor: wall.fillColor,
          strokeColor: wall.strokeColor,
          strokeWidth: wall.strokeWidth,
          bounds: wall.bounds,
          shapes: wall.shapes.map(shapeEditableToDoc),
          isInteractive: wall.isInteractive,
          isActive: wall.isActive,
          sortOrder: wall.sortOrder,
        });
      }

      setSaveStatus("Saved successfully");
    } catch (err) {
      console.error(err);
      setSaveStatus(`Save failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedGymId,
    selectedAreaId,
    mapId,
    mapSettings,
    features,
    labels,
    walls,
    upsertAreaMap,
    upsertWall,
  ]);

  // Deletion
  const handleDeleteWall = useCallback(
    async (index: number) => {
      const wall = walls[index];
      if (wall._id) {
        await deleteWallMut({ id: wall._id });
      }
      setWalls((prev) => prev.filter((_, i) => i !== index));
      setSelectedWallIndex(null);
    },
    [walls, deleteWallMut]
  );

  // Selection from canvas
  const handleCanvasSelect = useCallback(
    (type: "wall" | "feature" | "label", index: number, shapeIdx?: number) => {
      if (type === "wall") {
        setActiveTab("walls");
        setSelectedWallIndex(index);
        setSelectedFeatureIndex(null);
        setSelectedLabelIndex(null);
        setSelectedShapeIndex(shapeIdx ?? null);
      } else if (type === "feature") {
        setActiveTab("features");
        setSelectedFeatureIndex(index);
        setSelectedWallIndex(null);
        setSelectedLabelIndex(null);
        setSelectedShapeIndex(shapeIdx ?? null);
      } else {
        setActiveTab("labels");
        setSelectedLabelIndex(index);
        setSelectedWallIndex(null);
        setSelectedFeatureIndex(null);
        setSelectedShapeIndex(null);
      }
    },
    []
  );

  const tabs: { key: EditorTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: "walls",
      label: "Walls",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      count: walls.length,
    },
    {
      key: "features",
      label: "Features",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
        </svg>
      ),
      count: features.length,
    },
    {
      key: "labels",
      label: "Labels",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
      count: labels.length,
    },
    {
      key: "settings",
      label: "Settings",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-[#09090B]">
      {/* ── Canvas ────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#08080A]">
        {selectedAreaId ? (
          <MapCanvas
            viewBox={viewBox}
            walls={walls}
            features={features}
            labels={labels}
            selectedWallIndex={selectedWallIndex}
            selectedFeatureIndex={selectedFeatureIndex}
            selectedShapeIndex={selectedShapeIndex}
            selectedLabelIndex={selectedLabelIndex}
            onSelect={handleCanvasSelect}
            drawingMode={drawingMode}
            drawingTarget={drawingTarget}
            setDrawingMode={setDrawingMode}
            setWalls={setWalls}
            setFeatures={setFeatures}
            setLabels={setLabels}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600"><path d="M9 6.75V15m6-6v8.25m.503-13.498 4.875 1.625c.381.127.622.501.622.903v11.17a.75.75 0 0 1-1.026.695L15 17.25l-6 2.25-4.875-1.625A.75.75 0 0 1 3 17.172V6.002a.75.75 0 0 1 1.026-.695L9 6.75l6-2.25.503-.748Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-zinc-400">No area selected</p>
              <p className="mt-1 text-[12px] text-zinc-600">Select a gym and area in the sidebar to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right sidebar ────────────────────────────────────── */}
      <div className="flex w-[360px] min-w-[360px] flex-col border-l border-white/[0.06] bg-[#0C0C0F]">
        {/* Sidebar header: gym / area / zone selectors */}
        <div className="shrink-0 space-y-2 border-b border-white/[0.06] p-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Gym</label>
            <select
              className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] font-medium text-zinc-200 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              value={selectedGymId ?? ""}
              onChange={(e) => {
                setSelectedGymId((e.target.value as Id<"gyms">) || null);
                setSelectedAreaId(null);
                setWalls([]);
                setFeatures([]);
                setLabels([]);
                setMapId(null);
              }}
            >
              <option value="">Select gym...</option>
              {gyms?.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Area</label>
              {selectedGymId && (
                <button
                  className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 transition hover:text-blue-400"
                  onClick={async () => {
                    const name = prompt("Area name:");
                    if (!name || !selectedGymId) return;
                    const slug = name.toLowerCase().replace(/\s+/g, "-");
                    const newId = await createArea({ gymId: selectedGymId, slug, name, isActive: true });
                    setSelectedAreaId(newId);
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New
                </button>
              )}
            </div>
            <select
              className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] font-medium text-zinc-200 outline-none transition hover:bg-white/[0.06] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              value={selectedAreaId ?? ""}
              onChange={(e) => {
                setSelectedAreaId((e.target.value as Id<"gymAreas">) || null);
                setSelectedWallIndex(null);
                setSelectedFeatureIndex(null);
                setSelectedLabelIndex(null);
              }}
              disabled={!selectedGymId}
            >
              <option value="">Select area...</option>
              {areas?.map((a) => (
                <option key={a._id} value={a._id}>{a.name}{a.isActive ? "" : " (inactive)"}</option>
              ))}
            </select>
          </div>

          {selectedAreaId && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Zones <span className="text-zinc-600">({zones?.length ?? 0})</span>
                </label>
                <button
                  className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 transition hover:text-blue-400"
                  onClick={async () => {
                    const name = prompt("Zone name:");
                    if (!name || !selectedGymId || !selectedAreaId) return;
                    const slug = name.toLowerCase().replace(/\s+/g, "-");
                    await createZone({ gymId: selectedGymId, gymAreaId: selectedAreaId, slug, name, isActive: true });
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {zones?.map((z) => (
                  <span key={z._id} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    {z.name}
                  </span>
                ))}
                {(!zones || zones.length === 0) && (
                  <span className="text-[10px] text-zinc-600">No zones yet</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs + panel content (only when area selected) */}
        {selectedAreaId ? (
          <>
            {/* Tabs */}
            <div className="flex shrink-0 border-b border-white/[0.06]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`group relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${
                    activeTab === tab.key
                      ? "text-blue-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                        activeTab === tab.key ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.06] text-zinc-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
              {activeTab === "walls" && (
                <WallPanel
                  walls={walls}
                  setWalls={setWalls}
                  selectedIndex={selectedWallIndex}
                  setSelectedIndex={setSelectedWallIndex}
                  selectedShapeIndex={selectedShapeIndex}
                  setSelectedShapeIndex={setSelectedShapeIndex}
                  zones={zones ?? []}
                  onDelete={handleDeleteWall}
                  drawingMode={drawingMode}
                  setDrawingMode={setDrawingMode}
                  setDrawingTarget={setDrawingTarget}
                  onCopyShape={handleCopyShapeAt}
                  onPasteShape={handlePaste}
                  hasClipboard={clipboard !== null}
                />
              )}
              {activeTab === "features" && (
                <FeaturePanel
                  features={features}
                  setFeatures={setFeatures}
                  selectedIndex={selectedFeatureIndex}
                  setSelectedIndex={setSelectedFeatureIndex}
                  selectedShapeIndex={selectedShapeIndex}
                  setSelectedShapeIndex={setSelectedShapeIndex}
                  drawingMode={drawingMode}
                  setDrawingMode={setDrawingMode}
                  setDrawingTarget={setDrawingTarget}
                  onCopyShape={handleCopyShapeAt}
                  onPasteShape={handlePaste}
                  hasClipboard={clipboard !== null}
                />
              )}
              {activeTab === "labels" && (
                <LabelPanel
                  labels={labels}
                  setLabels={setLabels}
                  selectedIndex={selectedLabelIndex}
                  setSelectedIndex={setSelectedLabelIndex}
                />
              )}
              {activeTab === "settings" && (
                <MapSettingsPanel
                  settings={mapSettings}
                  setSettings={setMapSettings}
                />
              )}
            </div>

            {/* Sidebar footer: save */}
            <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.06] p-3">
              {saveStatus && (
                <span className={`flex items-center gap-1.5 text-[11px] font-medium ${saveStatus.startsWith("Save failed") ? "text-red-400" : "text-emerald-400"}`}>
                  {saveStatus.startsWith("Save failed") ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  )}
                  {saveStatus}
                </span>
              )}
              <div className="flex-1" />
              <button
                className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-5 text-[12px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-40 disabled:shadow-none"
                onClick={handleSave}
                disabled={isSaving || !selectedGymId || !selectedAreaId}
              >
                {isSaving ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[12px] text-zinc-600">Select a gym and area to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function shapeDocToEditable(shape: any): EditableShape {
  // Parse rotation from transform string if present
  let rotation: number | undefined;
  if (shape.transform?.value) {
    const match = shape.transform.value.match(/rotate\(([-\d.]+)/);
    if (match) rotation = Number(match[1]);
  }

  // Reconstruct segment data: prefer stored attributes, fall back to bounds
  let segment: EditableShape["segment"] | undefined;
  if (shape.type === "rect") {
    const attrs = shape.attributes;
    if (attrs?.segStartX && attrs?.segStartY && attrs?.segEndX && attrs?.segEndY && attrs?.segThickness) {
      segment = {
        start: { x: Number(attrs.segStartX), y: Number(attrs.segStartY) },
        end: { x: Number(attrs.segEndX), y: Number(attrs.segEndY) },
        thickness: Number(attrs.segThickness),
      };
    } else if (shape.bounds) {
      // Legacy fallback: guess from bounding box (horizontal assumption)
      segment = {
        start: { x: shape.bounds.x, y: shape.bounds.y + shape.bounds.height / 2 },
        end: { x: shape.bounds.x + shape.bounds.width, y: shape.bounds.y + shape.bounds.height / 2 },
        thickness: Math.max(shape.bounds.height, 8),
      };
    }
  }

  return {
    id: shape.id,
    type: shape.type === "polygon" ? "polygon" : shape.type === "path" ? "path" : "segment",
    bounds: shape.bounds,
    transform: shape.transform,
    rotation,
    points: shape.points,
    segment,
    pathData: shape.pathData,
    label: shape.label,
    className: shape.className,
    style: shape.style,
    attributes: shape.attributes,
    children: shape.children,
  };
}

function shapeEditableToDoc(shape: EditableShape) {
  // Build transform from rotation if set
  const bounds = shape.type === "segment" ? segmentBounds(shape.segment) : shape.bounds;
  let transform = shape.transform;
  if (shape.rotation && shape.rotation !== 0 && bounds) {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    transform = { value: `rotate(${shape.rotation} ${cx} ${cy})` };
  } else if (shape.rotation === 0 || shape.rotation === undefined) {
    transform = undefined;
  }

  // For segments, persist the actual endpoints as attributes so we can
  // faithfully reconstruct them on reload (bounding box is lossy).
  let attributes = shape.type === "segment" ? undefined : shape.attributes;
  if (shape.type === "segment" && shape.segment) {
    attributes = {
      segStartX: String(shape.segment.start.x),
      segStartY: String(shape.segment.start.y),
      segEndX: String(shape.segment.end.x),
      segEndY: String(shape.segment.end.y),
      segThickness: String(shape.segment.thickness),
    };
  }

  return {
    id: shape.id,
    type: (shape.type === "segment" ? "rect" : shape.type) as "rect" | "polygon" | "path",
    label: shape.label,
    bounds,
    transform,
    className: shape.className,
    style: shape.style,
    attributes,
    points: shape.points,
    pathData: shape.pathData,
    children: shape.children,
  };
}

function segmentBounds(segment?: EditableShape["segment"]) {
  if (!segment) return undefined;
  const minX = Math.min(segment.start.x, segment.end.x);
  const minY = Math.min(segment.start.y, segment.end.y) - segment.thickness / 2;
  const maxX = Math.max(segment.start.x, segment.end.x);
  const maxY = Math.max(segment.start.y, segment.end.y) + segment.thickness / 2;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function featureToDoc(feature: EditableFeature) {
  return {
    id: feature.id,
    type: feature.type,
    name: feature.name,
    fillColor: feature.fillColor,
    fillOpacity: feature.fillOpacity,
    strokeColor: feature.strokeColor,
    strokeWidth: feature.strokeWidth,
    patternColor: feature.patternColor,
    patternOpacity: feature.patternOpacity,
    bounds: feature.bounds,
    shapes: feature.shapes.map(shapeEditableToDoc),
  };
}

function offsetShape(shape: EditableShape, offset: number): EditableShape {
  const newId = `${shape.type}-${Math.random().toString(36).slice(2, 10)}`;
  if (shape.type === "segment" && shape.segment) {
    const newSegment = {
      start: { x: shape.segment.start.x + offset, y: shape.segment.start.y + offset },
      end: { x: shape.segment.end.x + offset, y: shape.segment.end.y + offset },
      thickness: shape.segment.thickness,
    };
    return {
      ...shape,
      id: newId,
      segment: newSegment,
      bounds: shape.bounds
        ? { x: shape.bounds.x + offset, y: shape.bounds.y + offset, width: shape.bounds.width, height: shape.bounds.height }
        : undefined,
    };
  }
  return {
    ...shape,
    id: newId,
    points: shape.points?.map((p) => ({ x: p.x + offset, y: p.y + offset })),
    bounds: shape.bounds
      ? { x: shape.bounds.x + offset, y: shape.bounds.y + offset, width: shape.bounds.width, height: shape.bounds.height }
      : undefined,
  };
}

function getCombinedBoundsShell(shapes: EditableShape[]) {
  const boxes = shapes
    .map((s) => {
      if (s.type === "segment" && s.segment) return segmentBounds(s.segment) ?? null;
      if (s.bounds) return s.bounds;
      if (s.points?.length) {
        const xs = s.points.map((p) => p.x);
        const ys = s.points.map((p) => p.y);
        return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
      }
      return null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
  if (!boxes.length) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
