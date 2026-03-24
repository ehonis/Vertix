import type { Doc } from "@/convex/_generated/dataModel";
import type { WallPartKey } from "@/lib/wallLocations";

type GymMap = Doc<"gymAreaMaps">;
type GymWall = Doc<"gymWalls">;

export type TopdownMapData = {
  svgView: string;
  displayWidth: number;
  displayHeight: number;
  nonClimbingFeatures: GymMap["nonClimbingFeatures"];
  overhangFeatures: GymMap["overhangFeatures"];
  labels: GymMap["labels"];
  walls: Array<
    Pick<GymWall, "_id" | "partKey" | "name" | "fillColor" | "sortOrder" | "bounds" | "shapes">
  >;
};

export function buildTopdownMapData(map: GymMap, walls: GymWall[]): TopdownMapData {
  return {
    svgView: map.svgView,
    displayWidth: map.displayWidth ?? 330,
    displayHeight: map.displayHeight ?? 290,
    nonClimbingFeatures: map.nonClimbingFeatures,
    overhangFeatures: map.overhangFeatures,
    labels: map.labels,
    walls: walls
      .filter(wall => wall.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(wall => ({
        _id: wall._id,
        partKey: wall.partKey as WallPartKey,
        name: wall.name,
        fillColor: wall.fillColor,
        sortOrder: wall.sortOrder,
        bounds: wall.bounds,
        shapes: wall.shapes,
      })),
  };
}
