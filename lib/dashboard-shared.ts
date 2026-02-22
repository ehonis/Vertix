import { RouteCompletion, RouteType } from "@/generated/prisma/browser";

export function splitRoutesByType(
  routes: (RouteCompletion & { route: { type: RouteType; grade: string } })[]
) {
  const boulderRoutes = routes.filter(route => route.route.type === RouteType.BOULDER);
  const ropeRoutes = routes.filter(route => route.route.type === RouteType.ROPE);
  return { boulderRoutes, ropeRoutes };
}

export function getRouteGradeCounts(
  ropeRoutes: (RouteCompletion & { route: { type: RouteType; grade: string } })[],
  boulderRoutes: (RouteCompletion & { route: { type: RouteType; grade: string } })[]
) {
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
  ];

  boulderRoutes.forEach(route => {
    const grade = route.route.grade;
    const gradeCount = boulderGradeCounts.find(g => g.grade === grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  ropeRoutes.forEach(route => {
    const grade = route.route.grade;
    const gradeCount = ropeGradeCounts.find(g => g.grade === grade);
    if (gradeCount) {
      gradeCount.count++;
    }
  });

  const completedBoulderGrades = boulderGradeCounts.filter(grade => grade.count > 0);
  const completedRopeGrades = ropeGradeCounts.filter(grade => grade.count > 0);

  return { boulderGradeCounts: completedBoulderGrades, ropeGradeCounts: completedRopeGrades };
}

interface TimePeriodCounts {
  [key: string]: number;
}

interface BreakdownItem {
  day: string;
  boulderCount: number;
  ropeCount: number;
}

interface DetailedCompletionData {
  boulderCount: number;
  ropeCount: number;
  timeFrame: "weekToDate" | "monthToDate" | "yearToDate" | "allTime";
  breakdown: BreakdownItem[];
}

export function getLineChartCompletionsData(
  routes: (RouteCompletion & { route: { type: RouteType; grade: string } })[],
  timeFrame: "weekToDate" | "monthToDate" | "yearToDate" | "allTime"
): DetailedCompletionData {
  const { boulderRoutes, ropeRoutes } = splitRoutesByType(routes);
  const now = new Date();

  const isInCurrentWeek = (date: Date): boolean => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return date >= weekStart && date <= weekEnd;
  };

  const isInCurrentMonth = (date: Date): boolean => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    return date >= monthStart && date <= monthEnd;
  };

  const isInCurrentYearToDate = (date: Date): boolean => {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    return date >= yearStart && date <= now;
  };

  const getPeriodKey = (date: Date): string => {
    switch (timeFrame) {
      case "weekToDate":
        return `${date.getMonth() + 1}-${date.getDate().toString().padStart(2, "0")}`;
      case "monthToDate":
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthStartDay = monthStart.getDay();
        const weekNumber = Math.ceil((date.getDate() + monthStartDay) / 7);
        const weekStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          (weekNumber - 1) * 7 + 1 - monthStartDay
        );
        return `${weekStart.getMonth() + 1}-${weekStart.getDate().toString().padStart(2, "0")}`;
      case "yearToDate":
        const monthName = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear().toString().slice(-2);
        return `${monthName} ${year}`;
      case "allTime":
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      default:
        return "";
    }
  };

  const boulderBreakdown: TimePeriodCounts = {};
  const ropeBreakdown: TimePeriodCounts = {};

  boulderRoutes.forEach(route => {
    const routeDate = new Date(route.completionDate);
    if (timeFrame === "weekToDate" && !isInCurrentWeek(routeDate)) {
      return;
    }
    if (timeFrame === "monthToDate" && !isInCurrentMonth(routeDate)) {
      return;
    }
    if (timeFrame === "yearToDate" && !isInCurrentYearToDate(routeDate)) {
      return;
    }
    const periodKey = getPeriodKey(routeDate);
    boulderBreakdown[periodKey] = (boulderBreakdown[periodKey] || 0) + 1;
  });

  ropeRoutes.forEach(route => {
    const routeDate = new Date(route.completionDate);
    if (timeFrame === "weekToDate" && !isInCurrentWeek(routeDate)) {
      return;
    }
    if (timeFrame === "monthToDate" && !isInCurrentMonth(routeDate)) {
      return;
    }
    if (timeFrame === "yearToDate" && !isInCurrentYearToDate(routeDate)) {
      return;
    }
    const periodKey = getPeriodKey(routeDate);
    ropeBreakdown[periodKey] = (ropeBreakdown[periodKey] || 0) + 1;
  });

  const formatBreakdown = (): BreakdownItem[] => {
    const dateKeys: string[] = [];
    let currentDate: Date;
    let endDate: Date;

    switch (timeFrame) {
      case "allTime":
        const allRoutes = [...boulderRoutes, ...ropeRoutes];
        if (allRoutes.length === 0) return [];

        const dates = allRoutes.map(route => new Date(route.completionDate));
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

        currentDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
        endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);
        while (currentDate <= endDate) {
          dateKeys.push(
            `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`
          );
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;

      case "yearToDate":
        currentDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        while (currentDate <= endDate) {
          const monthName = currentDate.toLocaleString("default", { month: "short" });
          const year = currentDate.getFullYear().toString().slice(-2);
          dateKeys.push(`${monthName} ${year}`);
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;

      case "monthToDate":
        currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        while (currentDate <= endDate) {
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - currentDate.getDay());
          dateKeys.push(
            `${weekStart.getMonth() + 1}-${weekStart.getDate().toString().padStart(2, "0")}`
          );
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;

      case "weekToDate":
        currentDate = new Date(now);
        currentDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 6);
        while (currentDate <= endDate) {
          dateKeys.push(
            `${currentDate.getMonth() + 1}-${currentDate.getDate().toString().padStart(2, "0")}`
          );
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
    }

    return dateKeys.map(dateKey => ({
      day: dateKey,
      boulderCount: boulderBreakdown[dateKey] || 0,
      ropeCount: ropeBreakdown[dateKey] || 0,
    }));
  };

  const boulderCount = Object.values(boulderBreakdown).reduce((sum, count) => sum + count, 0);
  const ropeCount = Object.values(ropeBreakdown).reduce((sum, count) => sum + count, 0);

  return {
    boulderCount,
    ropeCount,
    timeFrame,
    breakdown: formatBreakdown(),
  };
}
