import type { AppRouteType } from "@/lib/appTypes";

export type RouteStatsRoute = {
  id: string;
  title: string;
  grade: string;
  type: AppRouteType;
  color: string;
  setDate: Date;
  isArchive: boolean;
};

function splitRoutesByType(routes: RouteStatsRoute[]) {
  const boulderRoutes = routes.filter(route => route.type === "BOULDER");
  const ropeRoutes = routes.filter(route => route.type === "ROPE");
  return { boulderRoutes, ropeRoutes };
}

export function getAllGradeCounts(routes: RouteStatsRoute[]) {
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(routes);

  const boulderGradeCounts = [
    { grade: "vfeature", count: 0 },
    { grade: "vb", count: 0 },
    { grade: "v0", count: 0 },
    { grade: "v1", count: 0 },
    { grade: "v2", count: 0 },
    { grade: "v3", count: 0 },
    { grade: "v4", count: 0 },
    { grade: "v5", count: 0 },
    { grade: "v6", count: 0 },
    { grade: "v7", count: 0 },
    { grade: "v8", count: 0 },
    { grade: "v9", count: 0 },
    { grade: "v10", count: 0 },
    { grade: "v11", count: 0 },
    { grade: "v12", count: 0 },
    { grade: "v13", count: 0 },
    { grade: "v14", count: 0 },
    { grade: "v15", count: 0 },
  ];

  const ropeGradeCounts = [
    { grade: "5.feature", count: 0 },
    { grade: "5.B", count: 0 },
    { grade: "5.7", count: 0 },
    { grade: "5.8", count: 0 },
    { grade: "5.8+", count: 0 },
    { grade: "5.9", count: 0 },
    { grade: "5.9+", count: 0 },
    { grade: "5.10-", count: 0 },
    { grade: "5.10", count: 0 },
    { grade: "5.10+", count: 0 },
    { grade: "5.11-", count: 0 },
    { grade: "5.11", count: 0 },
    { grade: "5.11+", count: 0 },
    { grade: "5.12-", count: 0 },
    { grade: "5.12", count: 0 },
    { grade: "5.12+", count: 0 },
    { grade: "5.13-", count: 0 },
    { grade: "5.13", count: 0 },
    { grade: "5.13+", count: 0 },
    { grade: "5.14-", count: 0 },
    { grade: "5.14", count: 0 },
    { grade: "5.14+", count: 0 },
    { grade: "5.15-", count: 0 },
  ];

  boulderRoutes.forEach(route => {
    const gradeCount = boulderGradeCounts.find(g => g.grade === route.grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  ropeRoutes.forEach(route => {
    const gradeCount = ropeGradeCounts.find(g => g.grade === route.grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  return {
    boulderGradeCounts: boulderGradeCounts.filter(grade => grade.count > 0),
    ropeGradeCounts: ropeGradeCounts.filter(grade => grade.count > 0),
    ropeTotal: ropeRoutes.length,
    boulderTotal: boulderRoutes.length,
  };
}
