import type {
  AppRouteCompletion,
  AppRouteAttempt,
  AppRouteDetail,
  AppCommunityGrade,
} from "@/lib/appTypes";

type RawRouteDetail = Omit<AppRouteDetail, "communityGrades" | "completions" | "attempts"> & {
  communityGrades: Array<AppCommunityGrade>;
  completions: Array<{
    id: string;
    userId: string;
    routeId: string;
    flash: boolean;
    xpEarned: number;
    completionDate?: number | Date;
  }>;
  attempts: Array<{
    id: string;
    userId: string;
    routeId: string;
    attempts: number;
    attemptDate?: number | Date;
  }>;
};

export function hydrateRouteDetail(route: RawRouteDetail): AppRouteDetail {
  return {
    ...route,
    communityGrades: route.communityGrades.map(grade => ({
      ...grade,
      createdAt: grade.createdAt ?? new Date(0),
      updatedAt: grade.updatedAt ?? new Date(0),
    })),
    completions: route.completions.map(completion => ({
      id: completion.id,
      userId: completion.userId,
      routeId: completion.routeId,
      flash: completion.flash,
      xpEarned: completion.xpEarned,
      completionDate: completion.completionDate ? toDate(completion.completionDate) : new Date(0),
      isCompetition: false,
      competitionType: null,
      competitionId: null,
    })),
    attempts: route.attempts.map(attempt => ({
      id: attempt.id,
      userId: attempt.userId,
      routeId: attempt.routeId,
      attempts: attempt.attempts,
      attemptDate: attempt.attemptDate ? toDate(attempt.attemptDate) : new Date(0),
    })),
  };
}

export function buildCompletionRecord(
  route: Pick<AppRouteDetail, "id" | "title" | "grade" | "type" | "color">,
  completion: {
    id: string;
    userId: string;
    routeId: string;
    flash: boolean;
    xpEarned: number;
    completionDate: number | Date;
  }
): AppRouteCompletion {
  return {
    id: completion.id,
    userId: completion.userId,
    routeId: completion.routeId,
    flash: completion.flash,
    xpEarned: completion.xpEarned,
    completionDate: toDate(completion.completionDate),
    route: {
      id: route.id,
      title: route.title,
      grade: route.grade,
      type: route.type,
      color: route.color,
    },
  };
}

export function buildAttemptRecord(
  route: Pick<AppRouteDetail, "id" | "title" | "grade" | "type" | "color">,
  attempt: {
    id: string;
    userId: string;
    routeId: string;
    attempts: number;
    attemptDate: number | Date;
  }
): AppRouteAttempt {
  return {
    id: attempt.id,
    userId: attempt.userId,
    routeId: attempt.routeId,
    attempts: attempt.attempts,
    attemptDate: toDate(attempt.attemptDate),
    route: {
      id: route.id,
      title: route.title,
      grade: route.grade,
      type: route.type,
      color: route.color,
    },
  };
}

function toDate(value: number | Date) {
  return value instanceof Date ? value : new Date(value);
}
