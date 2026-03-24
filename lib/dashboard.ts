import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { buildAttemptRecord, buildCompletionRecord } from "@/lib/routeHydration";

function getConvex() {
  return createConvexServerClient();
}

export async function getCompletionData(username: string) {
  const data = await getConvex().query(api.routes.getProfileDashboardData, { username });

  if (!data) {
    return [];
  }

  return data.completions.map(completion => buildCompletionRecord(completion.route, completion));
}

export async function getAttemptsData(username: string) {
  const data = await getConvex().query(api.routes.getProfileDashboardData, { username });

  if (!data) {
    return [];
  }

  return data.attempts.map(attempt => buildAttemptRecord(attempt.route, attempt));
}
