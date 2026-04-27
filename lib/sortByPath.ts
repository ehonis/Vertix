/**
 * Utility for sorting routes by projection onto a polyline path.
 *
 * Given a polyline (array of {x, y} vertices) representing the sort direction
 * for a wall, this module projects route positions onto the path and returns
 * an arc-length parameter `t` for each route. Sorting by `t` gives the
 * correct left-to-right (or whatever direction the path defines) order.
 */

type Point = { x: number; y: number };

/**
 * Project a point onto the nearest location on a polyline, returning
 * how far along the polyline that projection is (arc-length from start).
 */
export function projectOntoPolyline(
  point: Point,
  pathPoints: Point[]
): { t: number; distance: number } {
  if (pathPoints.length === 0) {
    return { t: 0, distance: Infinity };
  }
  if (pathPoints.length === 1) {
    return {
      t: 0,
      distance: Math.hypot(point.x - pathPoints[0].x, point.y - pathPoints[0].y),
    };
  }

  let bestT = 0;
  let bestDist = Infinity;
  let cumulativeLength = 0;

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const a = pathPoints[i];
    const b = pathPoints[i + 1];
    const segDx = b.x - a.x;
    const segDy = b.y - a.y;
    const segLenSq = segDx * segDx + segDy * segDy;
    const segLen = Math.sqrt(segLenSq);

    if (segLen === 0) {
      // Degenerate segment — just check distance to the point
      const dist = Math.hypot(point.x - a.x, point.y - a.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestT = cumulativeLength;
      }
      continue;
    }

    // Project point onto the infinite line through a→b
    const tSeg = ((point.x - a.x) * segDx + (point.y - a.y) * segDy) / segLenSq;

    // Clamp to the segment [0, 1]
    const tClamped = Math.max(0, Math.min(1, tSeg));

    // Closest point on the segment
    const closestX = a.x + tClamped * segDx;
    const closestY = a.y + tClamped * segDy;
    const dist = Math.hypot(point.x - closestX, point.y - closestY);

    if (dist < bestDist) {
      bestDist = dist;
      bestT = cumulativeLength + tClamped * segLen;
    }

    cumulativeLength += segLen;
  }

  return { t: bestT, distance: bestDist };
}

/**
 * Compute the total arc length of a polyline.
 */
export function polylineLength(pathPoints: Point[]): number {
  let length = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    length += Math.hypot(
      pathPoints[i + 1].x - pathPoints[i].x,
      pathPoints[i + 1].y - pathPoints[i].y
    );
  }
  return length;
}

/**
 * Sort routes by their projection onto a polyline sort path.
 *
 * Routes without (x, y) coordinates are placed at the end.
 * Ties in arc-length are broken by sortOrder, then by title.
 */
export function sortRoutesByPath<
  T extends {
    x?: number | null;
    y?: number | null;
    order?: number | null;
    title: string;
  }
>(routes: T[], pathPoints: Point[]): T[] {
  if (pathPoints.length < 2) {
    // Not enough points to define a direction; fall back to no-op
    return routes;
  }

  return [...routes].sort((a, b) => {
    const hasA = typeof a.x === "number" && typeof a.y === "number";
    const hasB = typeof b.x === "number" && typeof b.y === "number";

    // Routes without coordinates go last
    if (!hasA && !hasB) {
      return fallbackCompare(a, b);
    }
    if (!hasA) return 1;
    if (!hasB) return -1;

    const projA = projectOntoPolyline({ x: a.x!, y: a.y! }, pathPoints);
    const projB = projectOntoPolyline({ x: b.x!, y: b.y! }, pathPoints);

    if (projA.t !== projB.t) {
      return projA.t - projB.t;
    }

    return fallbackCompare(a, b);
  });
}

function fallbackCompare(
  a: { order?: number | null; title: string },
  b: { order?: number | null; title: string }
): number {
  const ao = a.order ?? Number.POSITIVE_INFINITY;
  const bo = b.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return a.title.localeCompare(b.title);
}
