/**
 * Ordered grade lists for leaderboard grade-points (pyramid: 3×lower = 1×higher).
 * Excluded from points: vfeature, 5.feature, competition.
 */

export const BOULDER_GRADES_ORDERED = [
  "vb",
  "v0",
  "v1",
  "v2",
  "v3",
  "v4",
  "v5",
  "v6",
  "v7",
  "v8",
  "v9",
  "v10",
] as const;

export const ROPE_GRADES_ORDERED = [
  "5.b",
  "5.7-",
  "5.7",
  "5.7+",
  "5.8-",
  "5.8",
  "5.8+",
  "5.9-",
  "5.9",
  "5.9+",
  "5.10-",
  "5.10",
  "5.10+",
  "5.11-",
  "5.11",
  "5.11+",
  "5.12-",
  "5.12",
  "5.12+",
  "5.13-",
  "5.13",
  "5.13+",
] as const;

const EXCLUDED_BOULDER = new Set(["vfeature", "competition"]);
const EXCLUDED_ROPE = new Set(["5.feature", "competition"]);

function normalizeGrade(grade: string): string {
  const lower = grade.toLowerCase().trim();
  if (lower === "5.b") return "5.b";
  return lower;
}

/**
 * Returns the index of the grade in the ordered list (0 = lowest), or null if excluded/unknown.
 */
export function getBoulderGradeIndex(grade: string): number | null {
  const normalized = normalizeGrade(grade);
  if (EXCLUDED_BOULDER.has(normalized)) return null;
  const idx = BOULDER_GRADES_ORDERED.indexOf(normalized as (typeof BOULDER_GRADES_ORDERED)[number]);
  return idx === -1 ? null : idx;
}

/**
 * Returns the index of the grade in the ordered list (0 = lowest), or null if excluded/unknown.
 */
export function getRopeGradeIndex(grade: string): number | null {
  const normalized = normalizeGrade(grade);
  if (EXCLUDED_ROPE.has(normalized)) return null;
  const idx = ROPE_GRADES_ORDERED.indexOf(normalized as (typeof ROPE_GRADES_ORDERED)[number]);
  return idx === -1 ? null : idx;
}

export type GradeType = "boulder" | "rope";

/**
 * Returns grade index for the given type, or null if excluded/unknown.
 */
export function getGradeIndex(grade: string, type: GradeType): number | null {
  return type === "boulder" ? getBoulderGradeIndex(grade) : getRopeGradeIndex(grade);
}

/**
 * Returns the display form of the grade (e.g. "V6" for boulder, "5.12" for rope).
 */
export function formatGradeForDisplay(grade: string, type: GradeType): string {
  const normalized = normalizeGrade(grade);
  if (type === "boulder") {
    return normalized.toUpperCase();
  }
  return normalized;
}
