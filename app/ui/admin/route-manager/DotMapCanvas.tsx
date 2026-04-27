"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { TopdownMapData } from "@/lib/topdown";
import type { WallPartKey } from "@/lib/wallLocations";
import { colorHex, displayGrade } from "./constants";
import { DOT_RADIUS, getViewBox, resolveDotPlacement } from "./snap";

type Pt = { x: number; y: number };

export type DotRoute = {
  id: string;
  color: string;
  title: string;
  grade: string;
  x: number;
  y: number;
};

export type UnplacedRoute = {
  id: string;
  color: string;
  title: string;
  grade: string;
};

type Props = {
  map: TopdownMapData;
  dots: DotRoute[];
  unplacedRoutes: UnplacedRoute[];
  selectedId: string | null;
  activeDot: { position: Pt; color: string } | null;
  snap: boolean;
  mode: "view" | "create" | "edit";
  showLabels: boolean;
  onSelectDot: (id: string | null) => void;
  onDragMove: (pos: Pt, wallPart: WallPartKey | null) => void;
  onDragEnd?: () => void;
};

/** Smaller create dot radius */
const CREATE_DOT_EXTRA = 0.8;

const BOULDER_DEFAULT = "#8200DB";
const ROPE_DEFAULT = "#1447E6";

export default function DotMapCanvas(props: Props) {
  const {
    map,
    dots,
    selectedId,
    activeDot,
    snap,
    mode,
    showLabels,
    onSelectDot,
    onDragMove,
    onDragEnd,
  } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pt>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const view = getViewBox(map.svgView);

  const toSvg = useCallback(
    (clientX: number, clientY: number): Pt | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const local = pt.matrixTransform(ctm.inverse());
      return { x: local.x, y: local.y };
    },
    [],
  );

  // Drag handling
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      const p = toSvg(event.clientX, event.clientY);
      if (!p) return;
      const resolved = resolveDotPlacement(p, map.walls, view, snap);
      onDragMove(resolved.position, resolved.wallPart);
    };
    const handleUp = () => {
      setDragging(null);
      onDragEnd?.();
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, map.walls, view.minX, view.minY, view.width, view.height, snap, onDragMove, onDragEnd, toSvg]);

  // Middle-click panning
  useEffect(() => {
    if (!isPanning) return;
    const handleMove = (event: PointerEvent) => {
      if (!panStartRef.current) return;
      event.preventDefault();
      const dx = event.clientX - panStartRef.current.x;
      const dy = event.clientY - panStartRef.current.y;
      setPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
    };
    const handleUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isPanning]);

  // Scroll wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => {
      const next = prev - e.deltaY * 0.002;
      return Math.max(0.5, Math.min(3, next));
    });
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const viewBoxStr = `${view.minX} ${view.minY} ${view.width} ${view.height}`;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="max-h-[calc(100%-64px)] max-w-[calc(100%-48px)] touch-none select-none rounded-xl border border-white/[0.06] bg-[#0B0B0F] shadow-2xl shadow-black/40"
        style={{
          aspectRatio: `${view.width} / ${view.height}`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          overflow: "hidden",
        }}
        onPointerDown={event => {
          // Middle-click panning
          if (event.button === 1) {
            event.preventDefault();
            setIsPanning(true);
            panStartRef.current = {
              x: event.clientX,
              y: event.clientY,
              panX: pan.x,
              panY: pan.y,
            };
            return;
          }
          if (event.target === event.currentTarget) onSelectDot(null);
        }}
      >
        <defs>
          <filter id="rm-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* Background fill — matches map-editor */}
        <rect x={view.minX} y={view.minY} width={view.width} height={view.height} fill="#0B0B0F" />

        {/* ── Non-climbing features ── */}
        {/* Rendered exactly like topdown.tsx: solid fill using strokeColor ?? fillColor */}
        <g>
          {map.nonClimbingFeatures.map(feature => renderFeature(feature, false))}
        </g>

        {/* ── Overhang features ── */}
        {/* Rendered exactly like topdown.tsx: hatch pattern with per-feature colors */}
        <g>
          {map.overhangFeatures.map(feature => renderFeature(feature, true))}
        </g>

        {/* ── Map labels ── */}
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

        {/* ── Walls ── */}
        {/* Uses actual wall.fillColor (or boulder/rope defaults), NO forced opacity */}
        {map.walls.map(wall => {
          const isBoulder = (wall.partKey as string).startsWith("boulder");
          const fill = wall.fillColor ?? (isBoulder ? BOULDER_DEFAULT : ROPE_DEFAULT);
          return (
            <g key={wall._id} fill={fill}>
              {wall.shapes.map(shape => renderShape(shape))}
            </g>
          );
        })}

        {/* ── Route dots — render selected last so it appears on top ── */}
        {[...dots].sort((a, b) => {
          if (a.id === selectedId) return 1;
          if (b.id === selectedId) return -1;
          return 0;
        }).map(dot => {
          const isSelected = dot.id === selectedId;
          const fill = colorHex(dot.color);
          const gradeText = displayGrade(dot.grade);
          const isLight = dot.color === "white" || dot.color === "yellow";
          const textColor = isLight ? "#000000" : "#ffffff";
          const r = DOT_RADIUS + (isSelected ? 1.4 : 0);
          return (
            <g
              key={dot.id}
              transform={`translate(${dot.x} ${dot.y})`}
              style={{ cursor: "pointer" }}
              filter="url(#rm-dot-shadow)"
              onPointerDown={event => {
                event.stopPropagation();
                onSelectDot(dot.id);
                if (mode === "edit") {
                  (event.target as Element).setPointerCapture?.(event.pointerId);
                  setDragging(dot.id);
                }
              }}
            >
              {/* Outer selection ring */}
              {isSelected && (
                <circle r={DOT_RADIUS + 3.5} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={0.5} />
              )}
              {/* Main dot */}
              <circle
                r={r}
                fill={fill}
                stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.55)"}
                strokeWidth={isSelected ? 0.8 : 0.4}
              />
              {/* Grade text centered in dot */}
              <text
                x={0}
                y={0.3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={1.8}
                fontWeight="700"
                fill={textColor}
                fillOpacity={0.9}
                style={{ fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif', pointerEvents: "none" }}
              >
                {gradeText}
              </text>
              {/* Floating label (when toggled) */}
              {showLabels && (
                <g transform={`translate(${DOT_RADIUS + 2} ${-1})`}>
                  <rect
                    x={0}
                    y={-3.5}
                    width={Math.max((dot.title || gradeText).length * 2.2, 8)}
                    height={7}
                    rx={1.5}
                    fill="rgba(0,0,0,0.75)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={0.3}
                  />
                  <text
                    x={1.5}
                    y={1}
                    fontSize={3.5}
                    fill="#e4e4e7"
                    fontFamily="monospace"
                    dominantBaseline="middle"
                  >
                    {dot.title || gradeText}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Active create dot — smaller ── */}
        {activeDot && mode === "create" && (
          <g
            transform={`translate(${activeDot.position.x} ${activeDot.position.y})`}
            style={{ cursor: "grab" }}
            filter="url(#rm-dot-shadow)"
            onPointerDown={event => {
              event.stopPropagation();
              (event.target as Element).setPointerCapture?.(event.pointerId);
              setDragging("__active__");
            }}
          >
            {/* Pulsing ring — smaller */}
            <circle r={DOT_RADIUS + 2.5} fill={activeDot.color} fillOpacity={0.15}>
              <animate
                attributeName="r"
                values={`${DOT_RADIUS + 2};${DOT_RADIUS + 3.5};${DOT_RADIUS + 2}`}
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Core dot — smaller */}
            <circle
              r={DOT_RADIUS + CREATE_DOT_EXTRA}
              fill={activeDot.color}
              stroke="#ffffff"
              strokeWidth={0.7}
            />
          </g>
        )}
      </svg>

      {/* Zoom controls — bottom-right overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#0c0c0f]/90 px-2 py-1 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="min-w-[32px] text-center text-[10px] font-mono text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button
            type="button"
            onClick={resetView}
            className="ml-1 flex h-5 items-center rounded px-1 text-[9px] font-medium text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-400"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── Rendering helpers — ported from topdown.tsx ──────────────────────────

type ShapeType = TopdownMapData["walls"][number]["shapes"][number];

type ShapeStyle = {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Render a feature (non-climbing or overhang) exactly like topdown.tsx.
 * - Non-climbing: solid fill using strokeColor ?? fillColor
 * - Overhang (patterned): hatch fill with per-feature pattern colors, hidden edge outlines
 */
function renderFeature(
  feature: TopdownMapData["nonClimbingFeatures"][number],
  patterned: boolean,
) {
  const hatchId = `rm-overhang-${feature.id}`;
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
          <pattern
            id={hatchId}
            patternUnits="userSpaceOnUse"
            width="5"
            height="5"
            patternTransform="rotate(35)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="5"
              stroke={patternColor}
              strokeWidth="2.25"
              strokeDasharray="2 1.5"
            />
          </pattern>
        </defs>
      )}
      {feature.shapes.map(shape => {
        const hiddenEdges =
          shape.attributes?.hiddenEdges?.split(",").filter(Boolean) ?? [];
        const useHiddenOutline = patterned && hiddenEdges.length > 0;
        return (
          <g key={shape.id}>
            {renderShape(shape, {
              fill,
              fillOpacity,
              stroke: useHiddenOutline
                ? "transparent"
                : patterned
                  ? strokeColor
                  : "transparent",
              strokeWidth: useHiddenOutline ? 0 : strokeWidth,
            })}
            {useHiddenOutline &&
              renderHiddenEdgeOutline(shape, hiddenEdges, strokeColor, strokeWidth)}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Render a single shape with proper rotation handling — matches topdown.tsx exactly.
 */
function renderShape(shape: ShapeType, style: ShapeStyle = {}) {
  const common = {
    fill: style.fill,
    fillOpacity: style.fillOpacity,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
  };
  const transform = getShapeTransform(shape);

  // Segment rects: render as oriented polygon (rotation baked into geometry)
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
        points={shape.points.map(p => `${p.x},${p.y}`).join(" ")}
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
    return (
      <path key={shape.id} d={shape.pathData} transform={transform} {...common} />
    );
  }

  if (shape.points) {
    return (
      <polygon
        key={shape.id}
        points={shape.points.map(p => `${p.x},${p.y}`).join(" ")}
        transform={transform}
        {...common}
      />
    );
  }

  return null;
}

/**
 * Compute rotation transform around the correct center (polygon centroid, bounds
 * center, etc.) — matches topdown.tsx's getShapeTransform exactly.
 */
function getShapeTransform(shape: ShapeType) {
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

function getShapeCenter(shape: ShapeType): Pt | null {
  if ((shape.type === "polygon" || shape.points?.length) && shape.points?.length) {
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

function shapeToSegmentPolygon(shape: ShapeType) {
  if (shape.type !== "rect") return null;
  const attrs = shape.attributes;
  if (
    !attrs?.segStartX ||
    !attrs?.segStartY ||
    !attrs?.segEndX ||
    !attrs?.segEndY ||
    !attrs?.segThickness
  ) {
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

/**
 * Render selective edge outlines for overhang shapes with hidden edges —
 * matches topdown.tsx exactly.
 */
function renderHiddenEdgeOutline(
  shape: ShapeType,
  hiddenEdges: string[],
  stroke: string,
  strokeWidth: number,
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
          return (
            <line
              key={key}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          );
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
        {top && (
          <line x1={b.x} y1={b.y} x2={b.x + b.width} y2={b.y} stroke={stroke} strokeWidth={strokeWidth} />
        )}
        {right && (
          <line x1={b.x + b.width} y1={b.y} x2={b.x + b.width} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />
        )}
        {bottom && (
          <line x1={b.x} y1={b.y + b.height} x2={b.x + b.width} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />
        )}
        {left && (
          <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.height} stroke={stroke} strokeWidth={strokeWidth} />
        )}
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
