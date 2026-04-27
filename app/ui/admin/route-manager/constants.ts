export const ROUTE_COLORS = [
  { id: "black", label: "Black", hex: "#111113" },
  { id: "white", label: "White", hex: "#F4F4F5" },
  { id: "gray", label: "Gray", hex: "#6B7280" },
  { id: "brown", label: "Brown", hex: "#7C2D12" },
  { id: "red", label: "Red", hex: "#EF4444" },
  { id: "orange", label: "Orange", hex: "#F97316" },
  { id: "yellow", label: "Yellow", hex: "#EAB308" },
  { id: "green", label: "Green", hex: "#22C55E" },
  { id: "blue", label: "Blue", hex: "#3B82F6" },
  { id: "purple", label: "Purple", hex: "#A855F7" },
  { id: "pink", label: "Pink", hex: "#EC4899" },
] as const;

export type RouteColorId = (typeof ROUTE_COLORS)[number]["id"];

export function colorHex(id: string | null | undefined) {
  const found = ROUTE_COLORS.find(c => c.id === id);
  return found?.hex ?? "#6B7280";
}

export const BOULDER_GRADES = [
  "competition",
  "vfeature",
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
];

const ROPE_BASE = ["5.7", "5.8", "5.9", "5.10", "5.11", "5.12", "5.13"];
const ROPE_MODS = ["-", "", "+"] as const;

export const ROPE_GRADES = [
  "competition",
  "5.feature",
  "5.b",
  ...ROPE_BASE.flatMap(base => ROPE_MODS.map(m => `${base}${m}`)),
];

export function displayGrade(grade: string) {
  if (!grade) return "";
  if (grade === "competition") return "Comp";
  if (grade === "vfeature") return "vFeat";
  if (grade === "5.feature") return "5.Feat";
  return grade.startsWith("v") ? grade.toUpperCase() : grade;
}
