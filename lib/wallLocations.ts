export const WALL_PART_KEYS = [
  "ropeNorthWest",
  "ropeNorthEast",
  "ABWall",
  "ropeSouth",
  "boulderSouth",
  "boulderMiddle",
  "boulderNorth",
] as const;

export type WallPartKey = (typeof WALL_PART_KEYS)[number];

const LEGACY_TO_WALL_PART_KEY = {
  ropeNorthWest: "ropeNorthWest",
  ropeNorthEast: "ropeNorthEast",
  ABWall: "ABWall",
  ropeSouth: "ropeSouth",
  ropeSouthWest: "ropeSouth",
  ropeSouthEast: "ropeSouth",
  boulderSouth: "boulderSouth",
  boulderMiddle: "boulderMiddle",
  boulderNorth: "boulderNorth",
  boulderNorthCave: "boulderNorth",
  boulderNorthSlab: "boulderNorth",
} as const;

const WALL_PART_TO_LEGACY = {
  ropeNorthWest: ["ropeNorthWest"],
  ropeNorthEast: ["ropeNorthEast"],
  ABWall: ["ABWall"],
  ropeSouth: ["ropeSouth", "ropeSouthWest", "ropeSouthEast"],
  boulderSouth: ["boulderSouth"],
  boulderMiddle: ["boulderMiddle"],
  boulderNorth: ["boulderNorth", "boulderNorthCave", "boulderNorthSlab"],
} as const satisfies Record<WallPartKey, readonly LegacyLocationKey[]>;

export type LegacyLocationKey = keyof typeof LEGACY_TO_WALL_PART_KEY;

export function isWallPartKey(value: string | null | undefined): value is WallPartKey {
  if (!value) {
    return false;
  }

  return WALL_PART_KEYS.includes(value as WallPartKey);
}

export function toWallPartKey(value: string | null | undefined): WallPartKey | null {
  if (!value) {
    return null;
  }

  if (isWallPartKey(value)) {
    return value;
  }

  if (value in LEGACY_TO_WALL_PART_KEY) {
    return LEGACY_TO_WALL_PART_KEY[value as LegacyLocationKey];
  }

  return null;
}

export function wallPartLabel(value: WallPartKey | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

export function legacyLocationsForWallPart(value: WallPartKey): readonly LegacyLocationKey[] {
  return WALL_PART_TO_LEGACY[value];
}
