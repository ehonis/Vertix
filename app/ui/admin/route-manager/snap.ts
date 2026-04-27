import type { TopdownMapData } from "@/lib/topdown";
import type { WallPartKey } from "@/lib/wallLocations";

type Wall = TopdownMapData["walls"][number];
type Shape = Wall["shapes"][number];
type Pt = { x: number; y: number };

export type Edge = {
  a: Pt;
  b: Pt;
  /** Outward unit normal (pointing away from shape interior). */
  nx: number;
  ny: number;
};

/** Pixels (in SVG viewBox units) to offset from wall edge. */
export const SNAP_OFFSET = 3.5;
/** Distance within which the dot gets sucked to the wall. */
export const SNAP_RADIUS = 18;
/** Dot radius on the map, in viewBox units. */
export const DOT_RADIUS = 3.2;

export function getViewBox(svgView: string) {
  const [minX, minY, width, height] = svgView.split(/\s+/).map(Number);
  return { minX, minY, width, height };
}

export function clampToViewBox(p: Pt, view: ReturnType<typeof getViewBox>, pad = DOT_RADIUS): Pt {
  return {
    x: Math.max(view.minX + pad, Math.min(view.minX + view.width - pad, p.x)),
    y: Math.max(view.minY + pad, Math.min(view.minY + view.height - pad, p.y)),
  };
}

/** Extract oriented edges (with outward normals) for every wall shape. */
function shapeToPolygon(shape: Shape): Pt[] | null {
  const attrs = shape.attributes;
  if (
    shape.type === "rect" &&
    attrs?.segStartX &&
    attrs?.segStartY &&
    attrs?.segEndX &&
    attrs?.segEndY &&
    attrs?.segThickness
  ) {
    const start = { x: Number(attrs.segStartX), y: Number(attrs.segStartY) };
    const end = { x: Number(attrs.segEndX), y: Number(attrs.segEndY) };
    const thickness = Number(attrs.segThickness);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * (thickness / 2);
    const oy = (dx / len) * (thickness / 2);
    return [
      { x: start.x + ox, y: start.y + oy },
      { x: end.x + ox, y: end.y + oy },
      { x: end.x - ox, y: end.y - oy },
      { x: start.x - ox, y: start.y - oy },
    ];
  }
  if (shape.type === "polygon" && shape.points?.length) {
    return shape.points.map(p => ({ x: p.x, y: p.y }));
  }
  if (shape.type === "rect" && shape.bounds) {
    const b = shape.bounds;
    return [
      { x: b.x, y: b.y },
      { x: b.x + b.width, y: b.y },
      { x: b.x + b.width, y: b.y + b.height },
      { x: b.x, y: b.y + b.height },
    ];
  }
  return null;
}

function polyCentroid(pts: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / pts.length, y: sy / pts.length };
}

function shapeEdges(shape: Shape): Edge[] {
  const poly = shapeToPolygon(shape);
  if (!poly || poly.length < 2) return [];
  const c = polyCentroid(poly);
  const edges: Edge[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len = Math.hypot(ex, ey) || 1;
    // Right-hand normal:
    let nx = -ey / len;
    let ny = ex / len;
    // Flip to point away from centroid:
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    if ((mx - c.x) * nx + (my - c.y) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    edges.push({ a, b, nx, ny });
  }
  return edges;
}

function closestPointOnSegment(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return { x: cx, y: cy, dist: Math.hypot(p.x - cx, p.y - cy) };
}

export type NearestWallResult = {
  wallPart: WallPartKey;
  distance: number;
  projected: Pt;
  edge: Edge;
};

/** Finds the nearest wall edge to `p` across all walls. */
export function nearestWallEdge(p: Pt, walls: Wall[]): NearestWallResult | null {
  let best: NearestWallResult | null = null;
  for (const wall of walls) {
    for (const shape of wall.shapes) {
      for (const edge of shapeEdges(shape)) {
        const hit = closestPointOnSegment(p, edge.a, edge.b);
        if (!best || hit.dist < best.distance) {
          best = {
            wallPart: wall.partKey as WallPartKey,
            distance: hit.dist,
            projected: { x: hit.x, y: hit.y },
            edge,
          };
        }
      }
    }
  }
  return best;
}

/**
 * Given a desired dot position, returns the resolved position and nearest wall.
 * When `snap` is true and the nearest wall is within SNAP_RADIUS, the position
 * is sucked to the outside of that wall (offset along outward normal).
 */
export function resolveDotPlacement(
  raw: Pt,
  walls: Wall[],
  view: ReturnType<typeof getViewBox>,
  snap: boolean
): { position: Pt; wallPart: WallPartKey | null } {
  const nearest = nearestWallEdge(raw, walls);
  if (!nearest) {
    return { position: clampToViewBox(raw, view), wallPart: null };
  }

  if (snap && nearest.distance <= SNAP_RADIUS) {
    const snapped = {
      x: nearest.projected.x + nearest.edge.nx * SNAP_OFFSET,
      y: nearest.projected.y + nearest.edge.ny * SNAP_OFFSET,
    };
    return { position: clampToViewBox(snapped, view), wallPart: nearest.wallPart };
  }

  return { position: clampToViewBox(raw, view), wallPart: nearest.wallPart };
}

export function routeTypeForWall(partKey: WallPartKey | null): "ROPE" | "BOULDER" {
  if (!partKey) return "BOULDER";
  return partKey.startsWith("rope") || partKey.startsWith("AB") ? "ROPE" : "BOULDER";
}
