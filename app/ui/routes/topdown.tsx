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
  const hatchId = `topdown-overhang-${feature.id}`;
  const patternColor = feature.patternColor ?? feature.strokeColor ?? "#4B5563";
  const strokeColor = feature.strokeColor ?? feature.patternColor ?? "#4B5563";
  const solidColor = feature.strokeColor ?? feature.fillColor ?? "#6B7280";
  const fill = patterned ? `url(#${hatchId})` : solidColor;
  const fillOpacity = patterned ? (feature.patternOpacity ?? 0.45) : 1;
  const strokeWidth = patterned ? (feature.strokeWidth ?? 1.5) : 0;

  return (
    <g key={feature.id}>
      {patterned && (
        <defs>
          <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={patternColor} strokeWidth="2.25" strokeDasharray="2 1.5" />
          </pattern>
        </defs>
      )}
      {feature.shapes.map(shape => {
        const hiddenEdges = shape.attributes?.hiddenEdges?.split(",").filter(Boolean) ?? [];
        const useHiddenOutline = patterned && hiddenEdges.length > 0;
        return (
          <g key={shape.id}>
            {renderShape(shape, {
              fill,
              fillOpacity,
              stroke: useHiddenOutline ? "transparent" : (patterned ? strokeColor : "transparent"),
              strokeWidth: useHiddenOutline ? 0 : strokeWidth,
            })}
            {useHiddenOutline && renderHiddenEdgeOutline(shape, hiddenEdges, strokeColor, strokeWidth)}
          </g>
        );
      })}
    </g>
  );
}

type ShapeStyle = {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
};

function renderShape(shape: TopdownMapData["walls"][number]["shapes"][number], style: ShapeStyle = {}) {
  const common = {
    fill: style.fill,
    fillOpacity: style.fillOpacity,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
  };
  const transform = getShapeTransform(shape);

  // Rect with baked-in segment attributes from the editor: render as oriented polygon
  // Segments bake rotation into geometry, so skip any visual rotation transform.
  const segPoly = shapeToSegmentPolygon(shape);
  if (segPoly) {
    return (
      <polygon
        key={shape.id}
        points={segPoly.map(p => `${p.x},${p.y}`).join(" ")}
        {...common}
      />
    );
  }

  if (shape.type === "polygon" && shape.points) {
    return (
      <polygon
        key={shape.id}
        points={shape.points.map(point => `${point.x},${point.y}`).join(" ")}
        transform={transform}
        {...common}
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
        transform={transform}
        {...common}
      />
    );
  }

  if (shape.type === "path" && shape.pathData) {
    return <path key={shape.id} d={shape.pathData} transform={transform} {...common} />;
  }

  if (shape.points) {
    return (
      <polygon
        key={shape.id}
        points={shape.points.map(point => `${point.x},${point.y}`).join(" ")}
        transform={transform}
        {...common}
      />
    );
  }

  return null;
}

/**
 * Matches the editor's rendering semantics: rotation is applied around the
 * shape center returned by `getShapeCenter` (polygon centroid, segment midpoint,
 * or bounds center) rather than the bounds center baked into the saved transform.
 */
function getShapeTransform(shape: TopdownMapData["walls"][number]["shapes"][number]) {
  const rotation = parseRotationAngle(shape.transform?.value);
  if (rotation === 0) return undefined;
  const center = getShapeCenter(shape);
  if (!center) return shape.transform?.value;
  return `rotate(${rotation} ${center.x} ${center.y})`;
}

function parseRotationAngle(transformValue?: string) {
  if (!transformValue) return 0;
  const match = transformValue.match(/rotate\(\s*([-\d.]+)/);
  return match ? Number(match[1]) : 0;
}

function getShapeCenter(
  shape: TopdownMapData["walls"][number]["shapes"][number]
): { x: number; y: number } | null {
  if (shape.type === "polygon" && shape.points?.length) {
    const sumX = shape.points.reduce((s, p) => s + p.x, 0);
    const sumY = shape.points.reduce((s, p) => s + p.y, 0);
    return { x: sumX / shape.points.length, y: sumY / shape.points.length };
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

function shapeToSegmentPolygon(shape: TopdownMapData["walls"][number]["shapes"][number]) {
  if (shape.type !== "rect") return null;
  const attrs = shape.attributes;
  if (!attrs?.segStartX || !attrs?.segStartY || !attrs?.segEndX || !attrs?.segEndY || !attrs?.segThickness) {
    return null;
  }
  const start = { x: Number(attrs.segStartX), y: Number(attrs.segStartY) };
  const end = { x: Number(attrs.segEndX), y: Number(attrs.segEndY) };
  const thickness = Number(attrs.segThickness);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const ox = (-dy / length) * (thickness / 2);
  const oy = (dx / length) * (thickness / 2);
  return [
    { x: start.x + ox, y: start.y + oy },
    { x: end.x + ox, y: end.y + oy },
    { x: end.x - ox, y: end.y - oy },
    { x: start.x - ox, y: start.y - oy },
  ];
}

function renderHiddenEdgeOutline(
  shape: TopdownMapData["walls"][number]["shapes"][number],
  hiddenEdges: string[],
  stroke: string,
  strokeWidth: number
) {
  const segPoly = shapeToSegmentPolygon(shape);
  const points = segPoly ?? (shape.type === "polygon" ? shape.points : null);
  const transform = segPoly ? undefined : getShapeTransform(shape);
  if (points && points.length) {
    return (
      <g transform={transform}>
        {points.map((p, i) => {
          const next = points[(i + 1) % points.length];
          const key = polygonEdgeKey(i, points.length);
          if (hiddenEdges.includes(key)) return null;
          return <line key={key} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={stroke} strokeWidth={strokeWidth} />;
        })}
      </g>
    );
  }

  if (shape.bounds) {
    const b = shape.bounds;
    const top = !hiddenEdges.includes("top");
    const right = !hiddenEdges.includes("right");
    const bottom = !hiddenEdges.includes("bottom");
    const left = !hiddenEdges.includes("left");
    return (
      <g transform={getShapeTransform(shape)}>
        {top && <line x1={b.x} y1={b.y} x2={b.x + b.width} y2={b.y} stroke={stroke} strokeWidth={strokeWidth} />}
        {right && <line x1={b.x + b.width} y1={b.y} x2={b.x + b.width} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />}
        {bottom && <line x1={b.x} y1={b.y + b.height} x2={b.x + b.width} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />}
        {left && <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />}
      </g>
    );
  }
  return null;
}

function polygonEdgeKey(index: number, pointCount: number) {
  if (pointCount === 4) {
    return ["top", "right", "bottom", "left"][index] ?? `edge-${index}`;
  }
  return `edge-${index}`;
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
