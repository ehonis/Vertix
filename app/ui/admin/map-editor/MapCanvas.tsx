"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EditableFeature,
  EditableLabel,
  EditableShape,
  EditableWall,
} from "./MapEditorShell";

type ViewBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

type DrawingTarget =
  | { type: "wall"; wallIndex: number }
  | { type: "feature"; featureIndex: number }
  | null;

type DragState =
  | { type: "label"; index: number; offsetX: number; offsetY: number }
  | {
      type: "shape-move";
      owner: "wall" | "feature";
      ownerIndex: number;
      shapeIndex: number;
      startPointer: { x: number; y: number };
      startShape: EditableShape;
    }
  | {
      type: "segment-endpoint";
      owner: "wall" | "feature";
      ownerIndex: number;
      shapeIndex: number;
      endpoint: "start" | "end";
    }
  | {
      type: "segment-side";
      owner: "wall" | "feature";
      ownerIndex: number;
      shapeIndex: number;
      side: "left" | "right";
      startSegment: NonNullable<EditableShape["segment"]>;
    }
  | {
      type: "polygon-point";
      owner: "wall" | "feature";
      ownerIndex: number;
      shapeIndex: number;
      pointIndex: number;
    }
  | {
      type: "rotation-handle";
      owner: "wall" | "feature";
      ownerIndex: number;
      shapeIndex: number;
      center: { x: number; y: number };
      startRotation: number;
      startAngle: number;
      startSegment?: NonNullable<EditableShape["segment"]>;
    }
  | null;

type MapCanvasProps = {
  viewBox: ViewBox;
  walls: EditableWall[];
  features: EditableFeature[];
  labels: EditableLabel[];
  selectedWallIndex: number | null;
  selectedFeatureIndex: number | null;
  selectedShapeIndex: number | null;
  selectedLabelIndex: number | null;
  onSelect: (type: "wall" | "feature" | "label", index: number, shapeIndex?: number) => void;
  drawingMode: "none" | "segment" | "polygon" | "triangle";
  drawingTarget: DrawingTarget;
  setDrawingMode: (mode: "none" | "segment" | "polygon" | "triangle") => void;
  setWalls: React.Dispatch<React.SetStateAction<EditableWall[]>>;
  setFeatures: React.Dispatch<React.SetStateAction<EditableFeature[]>>;
  setLabels: React.Dispatch<React.SetStateAction<EditableLabel[]>>;
};

const DEFAULT_SEGMENT_THICKNESS = 12;

export function MapCanvas({
  viewBox,
  walls,
  features,
  labels,
  selectedWallIndex,
  selectedFeatureIndex,
  selectedShapeIndex,
  selectedLabelIndex,
  onSelect,
  drawingMode,
  drawingTarget,
  setDrawingMode,
  setWalls,
  setFeatures,
  setLabels,
}: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [segmentStart, setSegmentStart] = useState<{ x: number; y: number } | null>(null);
  const [draftSegmentEnd, setDraftSegmentEnd] = useState<{ x: number; y: number } | null>(null);
  const [draftPolygon, setDraftPolygon] = useState<Array<{ x: number; y: number }>>([]);
  const [dragState, setDragState] = useState<DragState>(null);

  const labelFontSize = useMemo(() => Math.max(viewBox.width, viewBox.height) * 0.02, [viewBox]);

  function getSvgPoint(event: React.MouseEvent<SVGSVGElement> | React.MouseEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const rawX = viewBox.minX + ((event.clientX - rect.left) / rect.width) * viewBox.width;
    const rawY = viewBox.minY + ((event.clientY - rect.top) / rect.height) * viewBox.height;
    return clampPoint(rawX, rawY);
  }

  function clampPoint(x: number, y: number) {
    return {
      x: Math.max(viewBox.minX, Math.min(viewBox.minX + viewBox.width, x)),
      y: Math.max(viewBox.minY, Math.min(viewBox.minY + viewBox.height, y)),
    };
  }

  function patchOwnerShape(
    owner: "wall" | "feature",
    ownerIndex: number,
    shapeIndex: number,
    updater: (shape: EditableShape) => EditableShape
  ) {
    if (owner === "wall") {
      setWalls((prev) =>
        prev.map((wall, index) => {
          if (index !== ownerIndex) return wall;
          const shapes = wall.shapes.map((shape, currentIndex) =>
            currentIndex === shapeIndex ? updater(shape) : shape
          );
          return { ...wall, shapes, bounds: getCombinedBounds(shapes) };
        })
      );
      return;
    }

    setFeatures((prev) =>
      prev.map((feature, index) => {
        if (index !== ownerIndex) return feature;
        const shapes = feature.shapes.map((shape, currentIndex) =>
          currentIndex === shapeIndex ? updater(shape) : shape
        );
        return { ...feature, shapes, bounds: getCombinedBounds(shapes) };
      })
    );
  }

  function addShape(shape: EditableShape) {
    if (!drawingTarget) return;

    if (drawingTarget.type === "wall") {
      setWalls((prev) =>
        prev.map((wall, index) =>
          index === drawingTarget.wallIndex
            ? { ...wall, shapes: [...wall.shapes, shape], bounds: getCombinedBounds([...wall.shapes, shape]) }
            : wall
        )
      );
    } else {
      setFeatures((prev) =>
        prev.map((feature, index) =>
          index === drawingTarget.featureIndex
            ? {
                ...feature,
                shapes: [...feature.shapes, shape],
                bounds: getCombinedBounds([...feature.shapes, shape]),
              }
            : feature
        )
      );
    }
  }

  function handleMouseDown(event: React.MouseEvent<SVGSVGElement>) {
    const point = getSvgPoint(event);
    if (drawingMode === "segment") {
      setSegmentStart(point);
      setDraftSegmentEnd(point);
    }
  }

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    const point = getSvgPoint(event);

    if (drawingMode === "segment" && segmentStart) {
      // Lock segment creation to horizontal -- only length changes
      setDraftSegmentEnd({ x: point.x, y: segmentStart.y });
      return;
    }

    if (dragState?.type === "label") {
      const rawX = point.x - dragState.offsetX;
      const rawY = point.y - dragState.offsetY;
      const clampedX = Math.max(viewBox.minX, Math.min(viewBox.minX + viewBox.width, rawX));
      const clampedY = Math.max(viewBox.minY, Math.min(viewBox.minY + viewBox.height, rawY));
      setLabels((prev) =>
        prev.map((label, index) =>
          index === dragState.index
            ? { ...label, x: clampedX, y: clampedY }
            : label
        )
      );
      return;
    }

    if (dragState?.type === "shape-move") {
      const dx = point.x - dragState.startPointer.x;
      const dy = point.y - dragState.startPointer.y;
      patchOwnerShape(dragState.owner, dragState.ownerIndex, dragState.shapeIndex, () =>
        clampShapeInViewBox(translateShape(dragState.startShape, dx, dy), viewBox)
      );
      return;
    }

    if (dragState?.type === "segment-endpoint") {
      patchOwnerShape(dragState.owner, dragState.ownerIndex, dragState.shapeIndex, (shape) => {
        if (!shape.segment) return shape;

        // Project mouse onto the segment axis so dragging only changes length
        const anchor = dragState.endpoint === "start" ? shape.segment.end : shape.segment.start;
        const moving = dragState.endpoint === "start" ? shape.segment.start : shape.segment.end;

        // Axis direction from anchor to the current moving endpoint
        const axisX = moving.x - anchor.x;
        const axisY = moving.y - anchor.y;
        const axisLen = Math.hypot(axisX, axisY) || 1;
        const unitX = axisX / axisLen;
        const unitY = axisY / axisLen;

        // Project the mouse position onto the axis line through anchor
        const toMouseX = point.x - anchor.x;
        const toMouseY = point.y - anchor.y;
        const projection = toMouseX * unitX + toMouseY * unitY;

        // Don't allow the endpoint to collapse past the anchor (min length of 2)
        const clampedProjection = Math.max(2, projection);

        const newEndpoint = {
          x: anchor.x + unitX * clampedProjection,
          y: anchor.y + unitY * clampedProjection,
        };

        return {
          ...shape,
          segment: {
            ...shape.segment,
            [dragState.endpoint]: newEndpoint,
          },
          bounds: segmentBounds({
            ...shape.segment,
            [dragState.endpoint]: newEndpoint,
          }),
        };
      });
      return;
    }

    if (dragState?.type === "segment-side") {
      patchOwnerShape(dragState.owner, dragState.ownerIndex, dragState.shapeIndex, (shape) => {
        if (!shape.segment) return shape;
        const seg = dragState.startSegment;
        // Compute the perpendicular axis of the segment
        const dx = seg.end.x - seg.start.x;
        const dy = seg.end.y - seg.start.y;
        const len = Math.hypot(dx, dy) || 1;
        // Perpendicular unit vector (left = +perp, right = -perp)
        const perpX = -dy / len;
        const perpY = dx / len;
        const halfThick = seg.thickness / 2;

        // The fixed (opposite) side edge sits at center ± halfThick along perp.
        // "left" drag → right side is fixed (at center - halfThick along perp)
        // "right" drag → left side is fixed (at center + halfThick along perp)
        // We compute the fixed edge's distance from the segment axis origin (start point)
        // along the perpendicular, then figure out where the dragged edge should go.

        // Project mouse onto the perpendicular axis from the segment's start point
        const toMouseX = point.x - seg.start.x;
        const toMouseY = point.y - seg.start.y;
        const mousePerp = toMouseX * perpX + toMouseY * perpY;

        // Fixed side's perpendicular offset from the original center line
        const fixedPerp = dragState.side === "left" ? -halfThick : halfThick;
        // The dragged side goes to where the mouse is (along perp)
        const draggedPerp = mousePerp;

        // New thickness = distance between the two sides (min 2)
        const newThickness = Math.max(2, Math.abs(draggedPerp - fixedPerp));
        // New center line offset from the original axis = midpoint of the two sides
        const newCenterPerp = (draggedPerp + fixedPerp) / 2;

        // Shift the segment's start and end along the perpendicular to the new center
        const shiftX = perpX * newCenterPerp;
        const shiftY = perpY * newCenterPerp;
        const newSegment = {
          start: { x: seg.start.x + shiftX, y: seg.start.y + shiftY },
          end: { x: seg.end.x + shiftX, y: seg.end.y + shiftY },
          thickness: Math.round(newThickness),
        };
        return {
          ...shape,
          segment: newSegment,
          bounds: segmentBounds(newSegment),
        };
      });
      return;
    }

    if (dragState?.type === "polygon-point") {
      patchOwnerShape(dragState.owner, dragState.ownerIndex, dragState.shapeIndex, (shape) => {
        if (!shape.points) return shape;
        const nextPoints = shape.points.map((vertex, index) =>
          index === dragState.pointIndex ? point : vertex
        );
        return { ...shape, points: nextPoints, bounds: pointsBounds(nextPoints) };
      });
      return;
    }

    if (dragState?.type === "rotation-handle") {
      const currentAngle = Math.atan2(
        point.y - dragState.center.y,
        point.x - dragState.center.x
      ) * (180 / Math.PI);
      const delta = currentAngle - dragState.startAngle;

      patchOwnerShape(dragState.owner, dragState.ownerIndex, dragState.shapeIndex, (shape) => {
        // For segments: rotate the actual start/end points around center
        if (shape.type === "segment" && dragState.startSegment) {
          const rad = (delta * Math.PI) / 180;
          const cx = dragState.center.x;
          const cy = dragState.center.y;
          const rotPt = (px: number, py: number) => ({
            x: cx + (px - cx) * Math.cos(rad) - (py - cy) * Math.sin(rad),
            y: cy + (px - cx) * Math.sin(rad) + (py - cy) * Math.cos(rad),
          });
          const newStart = rotPt(dragState.startSegment.start.x, dragState.startSegment.start.y);
          const newEnd = rotPt(dragState.startSegment.end.x, dragState.startSegment.end.y);
          const newSegment = { ...dragState.startSegment, start: newStart, end: newEnd };
          return {
            ...shape,
            rotation: undefined, // angle is baked into geometry
            segment: newSegment,
            bounds: segmentBounds(newSegment),
          };
        }

        // For polygons: keep using visual rotation
        const rotation = Math.round(dragState.startRotation + delta);
        return { ...shape, rotation };
      });
    }
  }

  function handleMouseUp() {
    if (drawingMode === "segment" && segmentStart && draftSegmentEnd && drawingTarget) {
      const distance = Math.hypot(draftSegmentEnd.x - segmentStart.x, draftSegmentEnd.y - segmentStart.y);
      if (distance > 1) {
        addShape({
          id: makeId("segment"),
          type: "segment",
          segment: {
            start: segmentStart,
            end: draftSegmentEnd,
            thickness: DEFAULT_SEGMENT_THICKNESS,
          },
          bounds: segmentBounds({
            start: segmentStart,
            end: draftSegmentEnd,
            thickness: DEFAULT_SEGMENT_THICKNESS,
          }),
        });
      }

      setDrawingMode("none");
    }

    setSegmentStart(null);
    setDraftSegmentEnd(null);
    setDragState(null);
  }

  function handleCanvasDoubleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (drawingMode === "polygon" && draftPolygon.length >= 3) {
      event.preventDefault();
      event.stopPropagation();
      finishPolygon();
    }
  }

  function handleCanvasClick(event: React.MouseEvent<SVGSVGElement>) {
    if (drawingMode !== "polygon" && drawingMode !== "triangle") return;
    const point = getSvgPoint(event);
    const next = [...draftPolygon, point];

    if (drawingMode === "triangle" && next.length === 3) {
      addShape({
        id: makeId("triangle"),
        type: "polygon",
        points: next,
        bounds: pointsBounds(next),
      });
      setDraftPolygon([]);
      setDrawingMode("none");
      return;
    }

    setDraftPolygon(next);
  }

  function finishPolygon() {
    if (!drawingTarget || draftPolygon.length < 3) return;
    addShape({ id: makeId("polygon"), type: "polygon", points: draftPolygon, bounds: pointsBounds(draftPolygon) });
    setDraftPolygon([]);
    setDrawingMode("none");
  }

  // Keyboard shortcuts: Enter to finish polygon, Escape to cancel drawing
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" && drawingMode === "polygon" && draftPolygon.length >= 3) {
      finishPolygon();
    }
    if (e.key === "Escape" && drawingMode !== "none") {
      setDrawingMode("none");
      setDraftPolygon([]);
      setSegmentStart(null);
      setDraftSegmentEnd(null);
    }
  }, [drawingMode, draftPolygon]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const gridSpacing = useMemo(() => {
    const size = Math.max(viewBox.width, viewBox.height);
    if (size > 400) return 50;
    if (size > 150) return 25;
    return 10;
  }, [viewBox]);

  const gridLines = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const startX = Math.floor(viewBox.minX / gridSpacing) * gridSpacing;
    const startY = Math.floor(viewBox.minY / gridSpacing) * gridSpacing;
    for (let x = startX; x <= viewBox.minX + viewBox.width; x += gridSpacing) {
      lines.push({ x1: x, y1: viewBox.minY, x2: x, y2: viewBox.minY + viewBox.height });
    }
    for (let y = startY; y <= viewBox.minY + viewBox.height; y += gridSpacing) {
      lines.push({ x1: viewBox.minX, y1: y, x2: viewBox.minX + viewBox.width, y2: y });
    }
    return lines;
  }, [viewBox, gridSpacing]);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6">
      {/* Floating toolbar */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#111114]/95 px-4 py-2 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="pointer-events-auto flex items-center gap-1.5">
          {drawingMode !== "none" && (
            <span className="mr-0.5 flex h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
          )}
          <span className="text-[11px] font-medium text-zinc-400">
            {drawingMode === "segment"
              ? "Drag to draw segment"
              : drawingMode === "triangle"
                ? `Triangle: ${draftPolygon.length}/3 points`
                : drawingMode === "polygon"
                  ? draftPolygon.length < 3
                    ? `Polygon: ${draftPolygon.length} pts - click to add`
                    : `Polygon: ${draftPolygon.length} pts`
                  : "Select & drag to edit"}
          </span>
        </div>
        {drawingMode === "polygon" && draftPolygon.length >= 3 && (
          <button
            className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
            onClick={finishPolygon}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Finish
          </button>
        )}
        {drawingMode !== "none" && (
          <button
            className="pointer-events-auto rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.1] hover:text-white"
            onClick={() => { setDrawingMode("none"); setDraftPolygon([]); setSegmentStart(null); setDraftSegmentEnd(null); }}
          >
            Cancel
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        className="max-h-[calc(100%-64px)] max-w-[calc(100%-48px)] rounded-xl border border-white/[0.06] bg-[#0B0B0F] shadow-2xl shadow-black/40"
        style={{ aspectRatio: `${viewBox.width} / ${viewBox.height}` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        <rect x={viewBox.minX} y={viewBox.minY} width={viewBox.width} height={viewBox.height} fill="#0B0B0F" />

        {/* Grid */}
        {gridLines.map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="white" strokeOpacity={0.03} strokeWidth={0.5} />
        ))}

        {features.map((feature, featureIndex) => (
          <g key={feature.id}>
            {feature.shapes.map((shape, shapeIndex) => (
              <ShapeLayer
                key={shape.id}
                shape={shape}
                fill={feature.type === "overhang" ? "transparent" : feature.type === "mat" ? (feature.fillColor ?? "#3F3F46") : (feature.fillColor ?? "#6B7280")}
                fillOpacity={feature.type === "overhang" ? 0 : feature.fillOpacity ?? 0.35}
                stroke={feature.type === "overhang" ? (feature.strokeColor ?? feature.patternColor ?? "#4B5563") : feature.type === "mat" ? (feature.strokeColor ?? "transparent") : (feature.strokeColor ?? feature.fillColor ?? "#6B7280")}
                strokeWidth={feature.type === "overhang" ? (feature.strokeWidth ?? 1.5) : feature.type === "mat" ? (feature.strokeWidth ?? 0) : (feature.strokeWidth ?? 1)}
                selected={featureIndex === selectedFeatureIndex && shapeIndex === selectedShapeIndex}
                showHandles={featureIndex === selectedFeatureIndex && shapeIndex === selectedShapeIndex}
                onSelect={(event) => {
                  event.stopPropagation();
                  onSelect("feature", featureIndex, shapeIndex);
                }}
                onMoveStart={(event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "shape-move",
                    owner: "feature",
                    ownerIndex: featureIndex,
                    shapeIndex,
                    startPointer: getSvgPoint(event),
                    startShape: shape,
                  });
                }}
                onSegmentHandleMouseDown={(endpoint, event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "segment-endpoint",
                    owner: "feature",
                    ownerIndex: featureIndex,
                    shapeIndex,
                    endpoint,
                  });
                }}
                onSegmentSideMouseDown={(side, event) => {
                  event.stopPropagation();
                  if (!shape.segment) return;
                  setDragState({
                    type: "segment-side",
                    owner: "feature",
                    ownerIndex: featureIndex,
                    shapeIndex,
                    side,
                    startSegment: { ...shape.segment },
                  });
                }}
                onPolygonPointMouseDown={(pointIndex, event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "polygon-point",
                    owner: "feature",
                    ownerIndex: featureIndex,
                    shapeIndex,
                    pointIndex,
                  });
                }}
                onRotationHandleMouseDown={(event) => {
                  event.stopPropagation();
                  const center = getShapeCenter(shape);
                  if (!center) return;
                  const pointer = getSvgPoint(event);
                  const startAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x) * (180 / Math.PI);
                  setDragState({
                    type: "rotation-handle",
                    owner: "feature",
                    ownerIndex: featureIndex,
                    shapeIndex,
                    center,
                    startRotation: shape.rotation ?? 0,
                    startAngle,
                    startSegment: shape.segment ? { ...shape.segment } : undefined,
                  });
                }}
              />
            ))}
          </g>
        ))}

        {walls.map((wall, wallIndex) => (
          <g key={wall._id ?? wall.partKey ?? wallIndex}>
            {wall.shapes.map((shape, shapeIndex) => (
              <ShapeLayer
                key={shape.id}
                shape={shape}
                fill={wall.fillColor || "#1447E6"}
                fillOpacity={wall.fillOpacity ?? 0.9}
                stroke={wallIndex === selectedWallIndex && shapeIndex === selectedShapeIndex ? "#FFFFFF" : (wall.strokeColor ?? "rgba(255,255,255,0.25)")}
                strokeWidth={wallIndex === selectedWallIndex && shapeIndex === selectedShapeIndex ? 1 : (wall.strokeWidth ?? 0.5)}
                selected={wallIndex === selectedWallIndex && shapeIndex === selectedShapeIndex}
                showHandles={wallIndex === selectedWallIndex && shapeIndex === selectedShapeIndex}
                onSelect={(event) => {
                  event.stopPropagation();
                  onSelect("wall", wallIndex, shapeIndex);
                }}
                onMoveStart={(event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "shape-move",
                    owner: "wall",
                    ownerIndex: wallIndex,
                    shapeIndex,
                    startPointer: getSvgPoint(event),
                    startShape: shape,
                  });
                }}
                onSegmentHandleMouseDown={(endpoint, event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "segment-endpoint",
                    owner: "wall",
                    ownerIndex: wallIndex,
                    shapeIndex,
                    endpoint,
                  });
                }}
                onSegmentSideMouseDown={(side, event) => {
                  event.stopPropagation();
                  if (!shape.segment) return;
                  setDragState({
                    type: "segment-side",
                    owner: "wall",
                    ownerIndex: wallIndex,
                    shapeIndex,
                    side,
                    startSegment: { ...shape.segment },
                  });
                }}
                onPolygonPointMouseDown={(pointIndex, event) => {
                  event.stopPropagation();
                  setDragState({
                    type: "polygon-point",
                    owner: "wall",
                    ownerIndex: wallIndex,
                    shapeIndex,
                    pointIndex,
                  });
                }}
                onRotationHandleMouseDown={(event) => {
                  event.stopPropagation();
                  const center = getShapeCenter(shape);
                  if (!center) return;
                  const pointer = getSvgPoint(event);
                  const startAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x) * (180 / Math.PI);
                  setDragState({
                    type: "rotation-handle",
                    owner: "wall",
                    ownerIndex: wallIndex,
                    shapeIndex,
                    center,
                    startRotation: shape.rotation ?? 0,
                    startAngle,
                    startSegment: shape.segment ? { ...shape.segment } : undefined,
                  });
                }}
              />
            ))}
          </g>
        ))}

        {labels.map((label, labelIndex) => {
          const width = Math.max(label.text.length * (label.fontSize * 0.6), 36);
          const height = label.fontSize + 8;
          const isSelected = labelIndex === selectedLabelIndex;

          return (
            <g
              key={label.id}
              onMouseDown={(event) => {
                event.stopPropagation();
                const point = getSvgPoint(event);
                setDragState({
                  type: "label",
                  index: labelIndex,
                  offsetX: point.x - label.x,
                  offsetY: point.y - label.y,
                });
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect("label", labelIndex);
              }}
            >
              <rect
                x={label.x - width / 2}
                y={label.y - height + 2}
                width={width}
                height={height}
                fill={label.backgroundColor}
                opacity={label.backgroundOpacity}
                stroke={isSelected ? "#FFFFFF" : "transparent"}
                strokeWidth={isSelected ? 1 : 0}
                rx={2}
              />
              <text
                x={label.x}
                y={label.y}
                fill={label.fill}
                fontSize={label.fontSize || labelFontSize}
                textAnchor="middle"
                style={{ userSelect: "none", cursor: "move", pointerEvents: "none" }}
              >
                {label.text}
              </text>
            </g>
          );
        })}

        {segmentStart && draftSegmentEnd && (
          <SegmentShape
            segment={{ start: segmentStart, end: draftSegmentEnd, thickness: DEFAULT_SEGMENT_THICKNESS }}
            fill="rgba(59,130,246,0.25)"
            stroke="#60A5FA"
            strokeWidth={1.5}
          />
        )}

        {draftPolygon.length > 0 && (
          <>
            <polyline
              points={draftPolygon.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="rgba(168,85,247,0.12)"
              stroke="#C084FC"
              strokeWidth={1.5}
            />
            {draftPolygon.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r={1.5} fill="#C084FC" />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

function ShapeLayer({
  shape,
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  selected,
  showHandles,
  onSelect,
  onMoveStart,
  onSegmentHandleMouseDown,
  onSegmentSideMouseDown,
  onPolygonPointMouseDown,
  onRotationHandleMouseDown,
}: {
  shape: EditableShape;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  selected: boolean;
  showHandles: boolean;
  onSelect: (event: React.MouseEvent<SVGElement>) => void;
  onMoveStart: (event: React.MouseEvent<SVGElement>) => void;
  onSegmentHandleMouseDown: (endpoint: "start" | "end", event: React.MouseEvent<SVGElement>) => void;
  onSegmentSideMouseDown: (side: "left" | "right", event: React.MouseEvent<SVGElement>) => void;
  onPolygonPointMouseDown: (pointIndex: number, event: React.MouseEvent<SVGElement>) => void;
  onRotationHandleMouseDown: (event: React.MouseEvent<SVGElement>) => void;
}) {
  const rotationTransform = React.useMemo(() => {
    // Segments bake rotation into their geometry, so no visual transform needed
    if (shape.type === "segment") return undefined;
    if (!shape.rotation) return undefined;
    const center = getShapeCenter(shape);
    if (!center) return undefined;
    return `rotate(${shape.rotation} ${center.x} ${center.y})`;
  }, [shape]);

  return (
    <g transform={rotationTransform}>
      {shape.type === "segment" && shape.segment ? (
        <>
          <SegmentShape
            segment={shape.segment}
            fill={fill}
            stroke={selected ? "#FFFFFF" : stroke}
            strokeWidth={selected ? Math.max(1, strokeWidth) : strokeWidth}
            fillOpacity={fillOpacity}
            onClick={onSelect}
            onMouseDown={onMoveStart}
          />
          {showHandles && (
            <>
              <circle
                cx={shape.segment.start.x}
                cy={shape.segment.start.y}
                r={3}
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth={1}
                style={{ cursor: "grab" }}
                onMouseDown={(event) => onSegmentHandleMouseDown("start", event)}
              />
              <circle
                cx={shape.segment.end.x}
                cy={shape.segment.end.y}
                r={3}
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth={1}
                style={{ cursor: "grab" }}
                onMouseDown={(event) => onSegmentHandleMouseDown("end", event)}
              />
              <SegmentSideHandles
                segment={shape.segment}
                onMouseDown={onSegmentSideMouseDown}
              />
              <RotationHandle
                segment={shape.segment}
                onMouseDown={onRotationHandleMouseDown}
              />
            </>
          )}
        </>
      ) : shape.type === "polygon" && shape.points?.length ? (
        <>
          <polygon
            points={shape.points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={selected ? "#FFFFFF" : stroke}
            strokeWidth={selected ? Math.max(1, strokeWidth) : strokeWidth}
            onClick={onSelect}
            onMouseDown={onMoveStart}
          />
          {showHandles &&
            shape.points.map((point, pointIndex) => (
              <circle
                key={`${shape.id}-point-${pointIndex}`}
                cx={point.x}
                cy={point.y}
                r={2.8}
                fill="#A855F7"
                stroke="#FFFFFF"
                strokeWidth={1}
                style={{ cursor: "grab" }}
                onMouseDown={(event) => onPolygonPointMouseDown(pointIndex, event)}
              />
            ))}
          {showHandles && (() => {
            const center = getShapeCenter(shape);
            if (!center) return null;
            const handleX = center.x;
            const handleY = center.y - ROTATION_HANDLE_OFFSET;
            return (
              <>
                <line x1={center.x} y1={center.y} x2={handleX} y2={handleY} stroke="#10B981" strokeWidth={0.8} strokeDasharray="2 2" style={{ pointerEvents: "none" }} />
                <circle cx={handleX} cy={handleY} r={3.5} fill="#10B981" stroke="#FFFFFF" strokeWidth={1} style={{ cursor: "grab" }} onMouseDown={onRotationHandleMouseDown} />
                <text x={handleX + 5} y={handleY + 1} fill="#10B981" fontSize={4} style={{ pointerEvents: "none", userSelect: "none" }}>{shape.rotation ?? 0}°</text>
              </>
            );
          })()}
        </>
      ) : shape.type === "path" && shape.pathData ? (
        <path
          d={shape.pathData}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={selected ? "#FFFFFF" : stroke}
          strokeWidth={selected ? Math.max(1, strokeWidth) : strokeWidth}
          onClick={onSelect}
          onMouseDown={onMoveStart}
        />
      ) : null}
    </g>
  );
}

const ROTATION_HANDLE_OFFSET = 18;

function RotationHandle({
  segment,
  onMouseDown,
}: {
  segment: NonNullable<EditableShape["segment"]>;
  onMouseDown: (event: React.MouseEvent<SVGElement>) => void;
}) {
  const cx = (segment.start.x + segment.end.x) / 2;
  const cy = (segment.start.y + segment.end.y) / 2;

  // Compute actual angle from geometry
  const angleDeg = Math.round(
    Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * (180 / Math.PI)
  );

  // Place handle perpendicular to the segment, offset outward
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;

  const handleX = cx + perpX * ROTATION_HANDLE_OFFSET;
  const handleY = cy + perpY * ROTATION_HANDLE_OFFSET;

  return (
    <>
      <line
        x1={cx}
        y1={cy}
        x2={handleX}
        y2={handleY}
        stroke="#10B981"
        strokeWidth={0.8}
        strokeDasharray="2 2"
        style={{ pointerEvents: "none" }}
      />
      <circle
        cx={handleX}
        cy={handleY}
        r={3.5}
        fill="#10B981"
        stroke="#FFFFFF"
        strokeWidth={1}
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown}
      />
      <text
        x={handleX + 5}
        y={handleY + 1}
        fill="#10B981"
        fontSize={4}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {angleDeg}°
      </text>
    </>
  );
}

function SegmentSideHandles({
  segment,
  onMouseDown,
}: {
  segment: NonNullable<EditableShape["segment"]>;
  onMouseDown: (side: "left" | "right", event: React.MouseEvent<SVGElement>) => void;
}) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const halfThick = segment.thickness / 2;

  // Midpoint of the center line
  const mx = (segment.start.x + segment.end.x) / 2;
  const my = (segment.start.y + segment.end.y) / 2;

  // Left side handle (positive perpendicular direction)
  const leftX = mx + perpX * halfThick;
  const leftY = my + perpY * halfThick;

  // Right side handle (negative perpendicular direction)
  const rightX = mx - perpX * halfThick;
  const rightY = my - perpY * halfThick;

  return (
    <>
      <circle
        cx={leftX}
        cy={leftY}
        r={2.5}
        fill="#F59E0B"
        stroke="#FFFFFF"
        strokeWidth={1}
        style={{ cursor: "ew-resize" }}
        onMouseDown={(event) => onMouseDown("left", event)}
      />
      <circle
        cx={rightX}
        cy={rightY}
        r={2.5}
        fill="#F59E0B"
        stroke="#FFFFFF"
        strokeWidth={1}
        style={{ cursor: "ew-resize" }}
        onMouseDown={(event) => onMouseDown("right", event)}
      />
    </>
  );
}

function SegmentShape({
  segment,
  fill,
  stroke,
  strokeWidth,
  fillOpacity = 1,
  onClick,
  onMouseDown,
}: {
  segment: NonNullable<EditableShape["segment"]>;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillOpacity?: number;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  onMouseDown?: (event: React.MouseEvent<SVGElement>) => void;
}) {
  const polygon = segmentToPolygon(segment);

  return (
    <polygon
      points={polygon.map((point) => `${point.x},${point.y}`).join(" ")}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      onClick={onClick}
      onMouseDown={onMouseDown}
    />
  );
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCombinedBounds(shapes: EditableShape[]) {
  const boundsList = shapes
    .map((shape) => {
      if (shape.type === "segment") return segmentBounds(shape.segment) ?? null;
      if (shape.bounds) return shape.bounds;
      if (shape.points?.length) return pointsBounds(shape.points);
      return null;
    })
    .filter((value): value is { x: number; y: number; width: number; height: number } => value !== null);

  if (!boundsList.length) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...boundsList.map((bound) => bound.x));
  const minY = Math.min(...boundsList.map((bound) => bound.y));
  const maxX = Math.max(...boundsList.map((bound) => bound.x + bound.width));
  const maxY = Math.max(...boundsList.map((bound) => bound.y + bound.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function pointsBounds(points: Array<{ x: number; y: number }>) {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function segmentBounds(segment?: EditableShape["segment"]) {
  if (!segment) return undefined;
  return pointsBounds(segmentToPolygon(segment));
}

function translateShape(shape: EditableShape, dx: number, dy: number): EditableShape {
  if (shape.type === "segment" && shape.segment) {
    const segment = {
      ...shape.segment,
      start: { x: shape.segment.start.x + dx, y: shape.segment.start.y + dy },
      end: { x: shape.segment.end.x + dx, y: shape.segment.end.y + dy },
    };
    return { ...shape, segment, bounds: segmentBounds(segment) };
  }

  const points = shape.points?.map((point) => ({ x: point.x + dx, y: point.y + dy }));
  const bounds = shape.bounds
    ? { ...shape.bounds, x: shape.bounds.x + dx, y: shape.bounds.y + dy }
    : points?.length
      ? pointsBounds(points)
      : shape.bounds;

  return { ...shape, bounds, points };
}

function segmentToPolygon(segment: NonNullable<EditableShape["segment"]>) {
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

function getShapeCenter(shape: EditableShape): { x: number; y: number } | null {
  if (shape.type === "segment" && shape.segment) {
    return {
      x: (shape.segment.start.x + shape.segment.end.x) / 2,
      y: (shape.segment.start.y + shape.segment.end.y) / 2,
    };
  }
  if (shape.points?.length) {
    const sumX = shape.points.reduce((s, p) => s + p.x, 0);
    const sumY = shape.points.reduce((s, p) => s + p.y, 0);
    return { x: sumX / shape.points.length, y: sumY / shape.points.length };
  }
  if (shape.bounds) {
    return {
      x: shape.bounds.x + shape.bounds.width / 2,
      y: shape.bounds.y + shape.bounds.height / 2,
    };
  }
  return null;
}

function clampShapeInViewBox(shape: EditableShape, vb: { minX: number; minY: number; width: number; height: number }): EditableShape {
  const maxX = vb.minX + vb.width;
  const maxY = vb.minY + vb.height;

  // Get the actual rendered bounds of the shape
  let shapeBounds: { x: number; y: number; width: number; height: number } | null = null;

  if (shape.type === "segment" && shape.segment) {
    const poly = segmentToPolygon(shape.segment);
    shapeBounds = pointsBounds(poly);
  } else if (shape.points?.length) {
    shapeBounds = pointsBounds(shape.points);
  } else if (shape.bounds) {
    shapeBounds = shape.bounds;
  }

  if (!shapeBounds) return shape;

  // Calculate how much to nudge back
  let dx = 0;
  let dy = 0;
  if (shapeBounds.x < vb.minX) dx = vb.minX - shapeBounds.x;
  if (shapeBounds.y < vb.minY) dy = vb.minY - shapeBounds.y;
  if (shapeBounds.x + shapeBounds.width > maxX) dx = maxX - (shapeBounds.x + shapeBounds.width);
  if (shapeBounds.y + shapeBounds.height > maxY) dy = maxY - (shapeBounds.y + shapeBounds.height);

  if (dx === 0 && dy === 0) return shape;

  return translateShape(shape, dx, dy);
}
