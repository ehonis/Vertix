import { Route, RouteType } from "@/generated/prisma/browser";

// Helper function to split routes into boulder and rope routes
function splitRoutesByType(routes: Route[]) {
  const boulderRoutes = routes.filter(route => route.type === RouteType.BOULDER);
  const ropeRoutes = routes.filter(route => route.type === RouteType.ROPE);
  return { boulderRoutes, ropeRoutes };
}

export function getAllGradeCounts(routes: Route[]) {
  // Split routes into boulder and rope routes
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(routes);

  // Initialize arrays with all possible grades and zero counts
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

  // Count occurrences of each grade in boulder routes
  boulderRoutes.forEach(route => {
    const grade = route.grade;
    const gradeCount = boulderGradeCounts.find(g => g.grade === grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  // Count occurrences of each grade in rope routes
  ropeRoutes.forEach(route => {
    const grade = route.grade;
    const gradeCount = ropeGradeCounts.find(g => g.grade === grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  // Calculate totals
  const ropeTotal = ropeRoutes.length;
  const boulderTotal = boulderRoutes.length;

  // Filter out grades with zero counts before returning
  const filteredBoulderGrades = boulderGradeCounts.filter(grade => grade.count > 0);
  const filteredRopeGrades = ropeGradeCounts.filter(grade => grade.count > 0);

  return {
    boulderGradeCounts: filteredBoulderGrades,
    ropeGradeCounts: filteredRopeGrades,
    ropeTotal,
    boulderTotal,
  };
}
