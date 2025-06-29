import prisma from "@/prisma";
import { RouteCompletion, RouteType } from "@prisma/client";

export async function getCompletionData(userId:string) {
    const completedRoutes = await prisma.routeCompletion.findMany({
        where: {userId: userId},
        include: {
            route:{
                select:{
                    type:true,
                    grade:true,
                }
            }
        }
    })
    return completedRoutes
}
export async function getAttemptsData(userId:string) {
    const attempts = await prisma.routeAttempt.findMany({
        where: {userId: userId},
        include: {
            route:{
                select:{
                    type:true,
                    grade:true,
                }
            }
        }
    })
    return attempts
}
export function splitRoutesByType(routes: (RouteCompletion & {route: {type: RouteType , grade: string}})[]) {
    const boulderRoutes = routes.filter((route) => route.route.type === RouteType.BOULDER);
    const ropeRoutes = routes.filter((route) => route.route.type === RouteType.ROPE);
    return {boulderRoutes, ropeRoutes};
}
export function getRouteGradeCounts(ropeRoutes: (RouteCompletion & {route: {type: RouteType , grade: string}})[], boulderRoutes: (RouteCompletion & {route: {type: RouteType , grade: string}})[],) {
    // Initialize arrays with all possible grades and their counts set to 0
    const boulderGradeCounts = [
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
    
    // Count completed boulder routes by grade
    boulderRoutes.forEach(route => {
        const grade = route.route.grade;
        const gradeCount = boulderGradeCounts.find(g => g.grade === grade);
        if (gradeCount) {
            gradeCount.count++;
        }
    });
    
    // Count completed rope routes by grade
    ropeRoutes.forEach(route => {
        const grade = route.route.grade;
        const gradeCount = ropeGradeCounts.find(g => g.grade === grade);
        if (gradeCount) {
            gradeCount.count++;
        }
    });
     
    // Filter out grades with count 0 and return only completed grades
    const completedBoulderGrades = boulderGradeCounts.filter(grade => grade.count > 0);
    const completedRopeGrades = ropeGradeCounts.filter(grade => grade.count > 0);
    
    return {boulderGradeCounts: completedBoulderGrades, ropeGradeCounts: completedRopeGrades};
}

// Type definition for the completion counts by time period
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
    routes: (RouteCompletion & {route: {type: RouteType, grade: string}})[],
    timeFrame: "weekToDate" | "monthToDate" | "yearToDate" | "allTime"
): DetailedCompletionData {
    const {boulderRoutes, ropeRoutes} = splitRoutesByType(routes);
    const now = new Date();
    
    // Helper function to check if a date is in the current week
    const isInCurrentWeek = (date: Date): boolean => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return date >= weekStart && date <= weekEnd;
    };

    // Helper function to check if a date is in the current month
    const isInCurrentMonth = (date: Date): boolean => {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        return date >= monthStart && date <= monthEnd;
    };

    // Helper function to check if a date is in the current year to date
    const isInCurrentYearToDate = (date: Date): boolean => {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        yearStart.setHours(0, 0, 0, 0);
        
        return date >= yearStart && date <= now;
    };

    // Helper function to get the period key based on time frame
    const getPeriodKey = (date: Date): string => {
        switch (timeFrame) {
            case "weekToDate":
                // Format: "MM-DD" for displaying dates in month-day format
                return `${date.getMonth() + 1}-${date.getDate().toString().padStart(2, '0')}`;
            case "monthToDate":
                // Get the first day of the current month
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                // Get the day of the week (0-6) that the month starts on
                const monthStartDay = monthStart.getDay();
                // Calculate the week number (1-based) for the given date
                const weekNumber = Math.ceil((date.getDate() + monthStartDay) / 7);
                // Get the start date for this week
                const weekStart = new Date(date.getFullYear(), date.getMonth(), (weekNumber - 1) * 7 + 1 - monthStartDay);
                // Format as MM-DD
                return `${weekStart.getMonth() + 1}-${weekStart.getDate().toString().padStart(2, '0')}`;
            case "yearToDate":
                // Format: "Month YY"
                const monthName = date.toLocaleString('default', { month: 'short' });
                const year = date.getFullYear().toString().slice(-2);
                return `${monthName} ${year}`;
            case "allTime":
                // Format: "YYYY-MM" for all-time view
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            default:
                return '';
        }
    };

    // Initialize breakdown objects
    const boulderBreakdown: TimePeriodCounts = {};
    const ropeBreakdown: TimePeriodCounts = {};

    // Process boulder routes
    boulderRoutes.forEach(route => {
        const routeDate = new Date(route.completionDate);
        // For weekToDate, only include routes from the current week
        if (timeFrame === "weekToDate" && !isInCurrentWeek(routeDate)) {
            return;
        }
        // For monthToDate, only include routes from the current month
        if (timeFrame === "monthToDate" && !isInCurrentMonth(routeDate)) {
            return;
        }
        // For yearToDate, only include routes from January 1st to current date
        if (timeFrame === "yearToDate" && !isInCurrentYearToDate(routeDate)) {
            return;
        }
        const periodKey = getPeriodKey(routeDate);
        boulderBreakdown[periodKey] = (boulderBreakdown[periodKey] || 0) + 1;
    });

    // Process rope routes
    ropeRoutes.forEach(route => {
        const routeDate = new Date(route.completionDate);
        // For weekToDate, only include routes from the current week
        if (timeFrame === "weekToDate" && !isInCurrentWeek(routeDate)) {
            return;
        }
        // For monthToDate, only include routes from the current month
        if (timeFrame === "monthToDate" && !isInCurrentMonth(routeDate)) {
            return;
        }
        // For yearToDate, only include routes from January 1st to current date
        if (timeFrame === "yearToDate" && !isInCurrentYearToDate(routeDate)) {
            return;
        }
        const periodKey = getPeriodKey(routeDate);
        ropeBreakdown[periodKey] = (ropeBreakdown[periodKey] || 0) + 1;
    });

    // Convert breakdown objects to array of BreakdownItem
    const formatBreakdown = (): BreakdownItem[] => {
        // Generate all dates based on the time frame
        const dateKeys: string[] = [];
        let currentDate: Date;
        let endDate: Date;

        switch (timeFrame) {
            case "allTime":
                // Find the earliest and latest dates from all routes
                const allRoutes = [...boulderRoutes, ...ropeRoutes];
                if (allRoutes.length === 0) return [];

                const dates = allRoutes.map(route => new Date(route.completionDate));
                const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
                const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

                // Generate all months between earliest and latest
                currentDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
                endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);
                while (currentDate <= endDate) {
                    dateKeys.push(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`);
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                break;

            case "yearToDate":
                // Generate all months from January to current month
                currentDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                while (currentDate <= endDate) {
                    const monthName = currentDate.toLocaleString('default', { month: 'short' });
                    const year = currentDate.getFullYear().toString().slice(-2);
                    dateKeys.push(`${monthName} ${year}`);
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                break;

            case "monthToDate":
                // Generate all weeks in current month
                currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                while (currentDate <= endDate) {
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                    dateKeys.push(`${weekStart.getMonth() + 1}-${weekStart.getDate().toString().padStart(2, '0')}`);
                    currentDate.setDate(currentDate.getDate() + 7);
                }
                break;

            case "weekToDate":
                // Generate all days in current week
                currentDate = new Date(now);
                currentDate.setDate(now.getDate() - now.getDay()); // Start of week
                endDate = new Date(currentDate);
                endDate.setDate(currentDate.getDate() + 6); // End of week
                while (currentDate <= endDate) {
                    dateKeys.push(`${currentDate.getMonth() + 1}-${currentDate.getDate().toString().padStart(2, '0')}`);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                break;
        }

        // Convert to array of BreakdownItem
        return dateKeys.map(dateKey => ({
            day: dateKey,
            boulderCount: boulderBreakdown[dateKey] || 0,
            ropeCount: ropeBreakdown[dateKey] || 0
        }));
    };

    // Calculate total counts
    const boulderCount = Object.values(boulderBreakdown).reduce((sum, count) => sum + count, 0);
    const ropeCount = Object.values(ropeBreakdown).reduce((sum, count) => sum + count, 0);

    return {
        boulderCount,
        ropeCount,
        timeFrame,
        breakdown: formatBreakdown()
    };
}