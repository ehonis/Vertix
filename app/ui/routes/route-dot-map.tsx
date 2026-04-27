"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import type { TopdownMapData } from "@/lib/topdown";
import { colorHex, displayGrade } from "@/app/ui/admin/route-manager/constants";
import { DOT_RADIUS, getViewBox } from "@/app/ui/admin/route-manager/snap";

type Pt = { x: number; y: number };

export type RouteDot = {
  id: string;
  color: string;
  title: string;
  grade: string;
  x: number;
  y: number;
  completionCount: number;
};

type Props = {
  map: TopdownMapData;
  dots: RouteDot[];
  selectedId: string | null;
  onSelectDot: (id: string | null) => void;
};

const BOULDER_DEFAULT = "#8200DB";
const ROPE_DEFAULT = "#1447E6";

export default function RouteDotMap({ map, dots, selectedId, onSelectDot }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pt>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Touch pinch-zoom state
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<Pt | null>(null);

  const view = getViewBox(map.svgView);

  // Middle-click panning — global listeners while drag is active
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

  // Touch handlers for pan + pinch-zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.hypot(dx, dy);
        lastTouchCenter.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    },
    [pan.x, pan.y],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / lastTouchDist.current;
        setZoom(prev => Math.max(0.5, Math.min(3, prev * scale)));
        lastTouchDist.current = dist;

        // Pan from pinch center movement
        if (lastTouchCenter.current) {
          const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          setPan(prev => ({
            x: prev.x + (cx - lastTouchCenter.current!.x),
            y: prev.y + (cy - lastTouchCenter.current!.y),
          }));
          lastTouchCenter.current = { x: cx, y: cy };
        }
      } else if (e.touches.length === 1 && panStartRef.current) {
        const dx = e.touches[0].clientX - panStartRef.current.x;
        const dy = e.touches[0].clientY - panStartRef.current.y;
        setPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
      }
    },
    [],
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const viewBoxStr = `${view.minX} ${view.minY} ${view.width} ${view.height}`;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="max-h-[calc(100%-40px)] max-w-[calc(100%-24px)] touch-none select-none rounded-xl border border-white/[0.06] bg-[#0B0B0F] shadow-2xl shadow-black/40"
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
          // Deselect on background click
          if (event.target === event.currentTarget) {
            onSelectDot(null);
          }
        }}
      >
        <defs>
          <filter id="rp-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* Background */}
        <rect x={view.minX} y={view.minY} width={view.width} height={view.height} fill="#0B0B0F" />

        {/* Non-climbing features */}
        <g>
          {map.nonClimbingFeatures.map(feature => renderFeature(feature, false))}
        </g>

        {/* Overhang features */}
        <g>
          {map.overhangFeatures.map(feature => renderFeature(feature, true))}
        </g>

        {/* Map labels — fade out when zoomed */}
        {Math.abs(zoom - 1) < 0.05 && (
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

        {/* Walls */}
        {map.walls.map(wall => {
          const isBoulder = (wall.partKey as string).startsWith("boulder");
          const fill = wall.fillColor ?? (isBoulder ? BOULDER_DEFAULT : ROPE_DEFAULT);
          return (
            <g key={wall._id} fill={fill}>
              {wall.shapes.map(shape => renderShape(shape))}
            </g>
          );
        })}

        {/* Route dots - selected last for paint order */}
        {[...dots]
          .sort((a, b) => {
            if (a.id === selectedId) return 1;
            if (b.id === selectedId) return -1;
            return 0;
          })
          .map(dot => {
            const isSelected = dot.id === selectedId;
            const fill = colorHex(dot.color);
            const gradeText = displayGrade(dot.grade);
            const isLight = dot.color === "white" || dot.color === "yellow";
            const textColor = isLight ? "#000000" : "#ffffff";
            const r = DOT_RADIUS + (isSelected ? 1.4 : 0);
            const hasCompleted = dot.completionCount > 0;
            return (
              <g
                key={dot.id}
                transform={`translate(${dot.x} ${dot.y})`}
                style={{ cursor: "pointer" }}
                filter="url(#rp-dot-shadow)"
                onPointerDown={event => {
                  event.stopPropagation();
                  onSelectDot(dot.id);
                }}
              >
                {/* Completion ring */}
                {hasCompleted && !isSelected && (
                  <circle
                    r={DOT_RADIUS + 2.2}
                    fill="none"
                    stroke="#22C55E"
                    strokeOpacity={0.5}
                    strokeWidth={0.6}
                  />
                )}
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={DOT_RADIUS + 3.5}
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity={0.45}
                    strokeWidth={0.6}
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.45;0.15;0.45"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Main dot */}
                <circle
                  r={r}
                  fill={fill}
                  stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.55)"}
                  strokeWidth={isSelected ? 0.8 : 0.4}
                />
                {/* Grade text */}
                <text
                  x={0}
                  y={0.3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={1.8}
                  fontWeight="700"
                  fill={textColor}
                  fillOpacity={0.9}
                  style={{
                    fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
                    pointerEvents: "none",
                  }}
                >
                  {gradeText}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Zoom controls — bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#0c0c0f]/90 px-2 py-1 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="min-w-[36px] text-center text-[11px] font-mono text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button
            type="button"
            onClick={resetView}
            className="ml-1 flex h-6 items-center rounded px-1.5 text-[10px] font-medium text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-400"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── Rendering helpers — identical to DotMapCanvas / topdown.tsx ──────────

type ShapeType = TopdownMapData["walls"][number]["shapes"][number];

type ShapeStyle = {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
};

function renderFeature(
  feature: TopdownMapData["nonClimbingFeatures"][number],
  patterned: boolean,
) {
  const hatchId = `rp-overhang-${feature.id}`;
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
              x1="0" y1="0" x2="0" y2="5"
              stroke={patternColor}
              strokeWidth="2.25"
              strokeDasharray="2 1.5"
            />
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
              stroke: useHiddenOutline ? "transparent" : patterned ? strokeColor : "transparent",
              strokeWidth: useHiddenOutline ? 0 : strokeWidth,
            })}
            {useHiddenOutline && renderHiddenEdgeOutline(shape, hiddenEdges, strokeColor, strokeWidth)}
          </g>
        );
      })}
    </g>
  );
}

function renderShape(shape: ShapeType, style: ShapeStyle = {}) {
  const common = {
    fill: style.fill,
    fillOpacity: style.fillOpacity,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
  };
  const transform = getShapeTransform(shape);

  const segPoly = shapeToSegmentPolygon(shape);
  if (segPoly) {
    return (
      <polygon key={shape.id} points={segPoly.map(p => `${p.x},${p.y}`).join(" ")} {...common} />
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
    return <path key={shape.id} d={shape.pathData} transform={transform} {...common} />;
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
            <line key={key} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={stroke} strokeWidth={strokeWidth} />
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
