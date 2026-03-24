import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { findCommunityGradeForRoute } from "@/lib/route-shared";
import type { AppRouteDetail } from "@/lib/appTypes";
export {
  calculateCompletionXpForRoute,
  getRouteXp,
  calculateDynamicBountyXp,
  findIfBoulderGradeIsHigher,
  findIfRopeGradeIsHigher,
} from "@/lib/route-shared";

function getConvex() {
  return createConvexServerClient();
}

export async function getRouteById(id: string): Promise<AppRouteDetail | null> {
  try {
    const route = await getConvex().query(api.routes.getRouteByLegacyOrConvexId, { routeId: id });
    return route;
  } catch (error) {
    console.error(`Error finding route with id: ${id}`, error);
    return null;
  }
}

export async function findRating(
  _userId: string | undefined,
  _routeId: string
): Promise<{ stars: number; comment: string | null } | null> {
  return null;
}

export async function findIfCompleted(
  userId: string | undefined,
  routeId: string
): Promise<boolean> {
  if (!userId) return false;

  try {
    const route = await getConvex().query(api.routes.getRouteByLegacyOrConvexId, {
      routeId,
      viewerUserId: userId as any,
    });
    return (route?.completions.length ?? 0) > 0;
  } catch (error) {
    console.error(`Error checking completion status for route ${routeId} by user ${userId}`, error);
    return false;
  }
}

export async function findAllTotalSends(routeId: string): Promise<number> {
  try {
    const route = await getConvex().query(api.routes.getRouteByLegacyOrConvexId, { routeId });
    return route?.completions.length ?? 0;
  } catch (error) {
    console.error(`Error calculating total sends for route ${routeId}`, error);
    return 0;
  }
}

export async function findProposedGrade(
  userId: string | undefined,
  routeId: string
): Promise<string | null> {
  if (!userId) return null;

  try {
    const route = await getConvex().query(api.routes.getRouteByLegacyOrConvexId, { routeId });
    return route?.communityGrades.find(grade => grade.userId === userId)?.grade ?? null;
  } catch (error) {
    console.error(`Error finding proposed grade for route ${routeId} by user ${userId}`, error);
    return null;
  }
}

export async function findStarRating(_routeId: string): Promise<number> {
  return 0;
}

export async function findCommunityGrade(routeId: string): Promise<string> {
  try {
    const route = await getConvex().query(api.routes.getRouteByLegacyOrConvexId, { routeId });
    if (!route) {
      return "none";
    }
    return findCommunityGradeForRoute(
      route.communityGrades.map(grade => ({
        id: 0,
        grade: grade.grade,
        routeId: grade.routeId,
        userId: grade.userId,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      }))
    );
  } catch (error) {
    console.error(`Error finding community grade for route ${routeId}`, error);
    return "none";
  }
}
