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
export function splitRoutesByType(routes: (RouteCompletion & {route: {type: RouteType , grade: string}})[]) {
    const boulderRoutes = routes.filter((route) => route.route.type === RouteType.BOULDER);
    const ropeRoutes = routes.filter((route) => route.route.type === RouteType.ROPE);
    return {boulderRoutes, ropeRoutes};
}
export function getRouteGradeCounts(ropeRoutes: (RouteCompletion & {route: {type: RouteType , grade: string}})[], boulderRoutes: (RouteCompletion & {route: {type: RouteType , grade: string}})[],) {
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
        { grade: "5.8-", count: 0 },
        { grade: "5.8", count: 0 },
        { grade: "5.8+", count: 0 },
        { grade: "5.9-", count: 0 },
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
    return {boulderGradeCounts, ropeGradeCounts};
}