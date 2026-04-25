"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TopdownMapData } from "@/lib/topdown";
import { isWallPartKey, type WallPartKey } from "@/lib/wallLocations";

type TopDownProps = {
  map: TopdownMapData;
  onData: (data: WallPartKey | null) => void;
  initialSelection?: WallPartKey | null;
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
};

const ROPE_DEFAULT = "#1447E6";
const ROPE_DIMMED = "#0A2E8F";
const BOULDER_DEFAULT = "#8200DB";
const BOULDER_DIMMED = "#4D0099";
const SELECTED_COLOR = "#22C55E";

export default function TopDown({ map, onData, initialSelection = null }: TopDownProps) {
  const [selectedPart, setSelectedPart] = useState<WallPartKey | null>(initialSelection);
  const [viewBox, setViewBox] = useState(parseViewBox(map.svgView));
  const previousInitialSelection = useRef<WallPartKey | null>(initialSelection);
  const isUpdatingFromProps = useRef(false);

  useEffect(() => {
    if (initialSelection !== previousInitialSelection.current) {
      previousInitialSelection.current = initialSelection;
      isUpdatingFromProps.current = true;
      setSelectedPart(initialSelection);
      requestAnimationFrame(() => {
        isUpdatingFromProps.current = false;
      });
    }
  }, [initialSelection]);

  useEffect(() => {
    if (!isUpdatingFromProps.current) {
      onData(selectedPart);
    }
  }, [selectedPart, onData]);

  const walls = useMemo(() => map.walls, [map.walls]);

  useEffect(() => {
    const base = parseViewBox(map.svgView);

    if (!selectedPart) {
      setViewBox(base);
      return;
    }

    const wall = walls.find(item => item.partKey === selectedPart);

    if (!wall) {
      setViewBox(base);
      return;
    }

    const bounds = calculateWallBounds(wall.shapes);

    if (!bounds) {
      setViewBox(base);
      return;
    }

    const wallWidth = bounds.maxX - bounds.minX;
    const wallHeight = bounds.maxY - bounds.minY;
    const wallDiagonal = Math.sqrt(wallWidth * wallWidth + wallHeight * wallHeight);
    const baseDiagonal = Math.sqrt(base.width * base.width + base.height * base.height);
    const isZoomTight = selectedPart === "ABWall" || selectedPart === "boulderSouth";
    const fillPercentage = isZoomTight ? 0.55 : 0.75;
    const targetScale = Math.min(5, (baseDiagonal * fillPercentage) / wallDiagonal);
    const nextWidth = base.width / targetScale;
    const nextHeight = base.height / targetScale;
    const unclampedMinX = bounds.centerX - nextWidth / 2;
    const unclampedMinY = bounds.centerY - nextHeight / 2;

    setViewBox({
      minX: Math.max(base.minX, Math.min(unclampedMinX, base.minX + base.width - nextWidth)),
      minY: Math.max(base.minY, Math.min(unclampedMinY, base.minY + base.height - nextHeight)),
      width: nextWidth,
      height: nextHeight,
    });
  }, [map.svgView, selectedPart, walls]);

  const aspectRatio = `${map.displayWidth} / ${map.displayHeight}`;

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio }}>
      {selectedPart && (
        <button
          type="button"
          onClick={() => setSelectedPart(null)}
          className="absolute left-3 top-3 z-10 rounded-full border border-white/20 bg-slate-950/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
        >
          Back to full map
        </button>
      )}
      <svg
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="topdown-overhang-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <line x1="0" y1="0" x2="8" y2="8" stroke="#4B5563" strokeWidth="2" opacity="0.6" />
          </pattern>
        </defs>

        <g opacity={selectedPart ? 0.5 : 1}>
          {map.nonClimbingFeatures.map(feature => renderFeature(feature, false))}
        </g>

        <g>{map.overhangFeatures.map(feature => renderFeature(feature, true))}</g>

        {!selectedPart && (
          <g>
            {map.labels.map(label => {
              const fontSize = label.fontSize ?? 12;
              const padding = label.padding ?? 4;
              const width = Math.max(label.text.length * fontSize * 0.62 + padding * 2, 36);
              const height = fontSize + padding * 2;
              return (
                <g key={label.id} transform={label.transform?.value}>
                  <rect
                    x={label.x - width / 2}
                    y={label.y - height / 2}
                    width={width}
                    height={height}
                    rx={2}
                    fill={label.backgroundColor ?? "#000000"}
                    fillOpacity={label.backgroundOpacity ?? 0.7}
                    stroke={label.outlineColor ?? "#FFFFFF"}
                    strokeOpacity={label.outlineOpacity ?? 0}
                    strokeWidth={(label.outlineOpacity ?? 0) > 0 ? 1 : 0}
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    fill={label.fill ?? "#FFFFFF"}
                    fontSize={fontSize}
                    textAnchor={label.textAnchor ?? "middle"}
                    fontWeight="500"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'Inter, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif' }}
                  >
                    {label.text}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {walls.map(wall => {
          if (!isWallPartKey(wall.partKey)) {
            return null;
          }

          const partKey = wall.partKey;

          const isSelected = selectedPart === partKey;
          const hasSelection = selectedPart !== null;
          const fill = getWallColor(partKey, wall.fillColor, hasSelection, isSelected);

          return (
            <g
              key={wall._id}
              fill={fill}
              className={isSelected ? undefined : "cursor-pointer"}
              onClick={isSelected ? undefined : () => setSelectedPart(partKey)}
            >
              {wall.shapes.map(shape => renderShape(shape))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function renderFeature(feature: TopdownMapData["nonClimbingFeatures"][number], patterned: boolean) {
  return (
    <g
      key={feature.id}
      fill={patterned ? "url(#topdown-overhang-pattern)" : (feature.fillColor ?? "#6B7280")}
      fillOpacity={patterned ? (feature.fillOpacity ?? 0.8) : (feature.fillOpacity ?? 1)}
      stroke={patterned ? (feature.patternColor ?? "#4B5563") : feature.strokeColor}
      strokeOpacity={feature.strokeOpacity}
      strokeWidth={patterned ? (feature.strokeWidth ?? 1) : feature.strokeWidth}
    >
      {feature.shapes.map(shape => renderShape(shape))}
    </g>
  );
}

function renderShape(shape: TopdownMapData["walls"][number]["shapes"][number]) {
  if (shape.type === "polygon" && shape.points) {
    return (
      <polygon
        key={shape.id}
        points={shape.points.map(point => `${point.x},${point.y}`).join(" ")}
        transform={shape.transform?.value}
      />
    );
  }

  if (shape.type === "rect" && shape.bounds) {
    return (
      <rect
        key={shape.id}
        x={shape.bounds.x}
        y={shape.bounds.y}
        width={shape.bounds.width}
        height={shape.bounds.height}
        transform={shape.transform?.value}
      />
    );
  }

  if (shape.points) {
    return (
      <polygon
        key={shape.id}
        points={shape.points.map(point => `${point.x},${point.y}`).join(" ")}
        transform={shape.transform?.value}
      />
    );
  }

  return null;
}

function parseViewBox(svgView: string) {
  const [minX, minY, width, height] = svgView.split(/\s+/).map(Number);
  return {
    minX,
    minY,
    width,
    height,
  };
}

function calculateWallBounds(shapes: TopdownMapData["walls"][number]["shapes"]): Bounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const shape of shapes) {
    if (shape.bounds) {
      minX = Math.min(minX, shape.bounds.x);
      minY = Math.min(minY, shape.bounds.y);
      maxX = Math.max(maxX, shape.bounds.x + shape.bounds.width);
      maxY = Math.max(maxY, shape.bounds.y + shape.bounds.height);
      continue;
    }

    if (shape.points && shape.points.length > 0) {
      for (const point of shape.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function getWallColor(
  partKey: WallPartKey,
  fillColor: string | undefined,
  hasSelection: boolean,
  isSelected: boolean
) {
  if (isSelected) {
    return SELECTED_COLOR;
  }

  const isBoulderWall = partKey.startsWith("boulder");
  const defaultColor = fillColor ?? (isBoulderWall ? BOULDER_DEFAULT : ROPE_DEFAULT);

  if (!hasSelection) {
    return defaultColor;
  }

  return isBoulderWall ? BOULDER_DIMMED : ROPE_DIMMED;
}
