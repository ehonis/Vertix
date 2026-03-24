import type { AppUser } from "@/lib/appUser";

export type AppRouteType = "BOULDER" | "ROPE";

export type AppCommunityGrade = {
  id: string | number;
  userId: string;
  routeId: string;
  grade: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AppRouteCompletion = {
  id: string | number;
  userId: string;
  routeId: string;
  flash: boolean;
  xpEarned: number;
  completionDate?: Date;
  isCompetition?: boolean;
  competitionType?: string | null;
  competitionId?: string | null;
  route?: {
    id: string;
    title: string;
    grade: string;
    type: AppRouteType;
    color?: string;
  };
};

export type AppRouteAttempt = {
  id: string | number;
  userId: string;
  routeId: string;
  attempts: number;
  attemptDate?: Date;
  route?: {
    id: string;
    title: string;
    grade: string;
    type: AppRouteType;
    color?: string;
  };
};

export type AppRouteDetail = {
  id: string;
  convexId?: string;
  title: string;
  grade: string;
  color: string;
  type: AppRouteType;
  setDate: number;
  isArchive: boolean;
  xp: number;
  bonusXp: number;
  x: number | null;
  y: number | null;
  order: number | null;
  location: string;
  communityGrades: AppCommunityGrade[];
  completions: Array<{
    id: string | number;
    userId: string;
    routeId: string;
    flash: boolean;
    xpEarned: number;
    completionDate?: Date;
    isCompetition?: boolean;
    competitionType?: string | null;
    competitionId?: string | null;
  }>;
  attempts: Array<{
    id: string | number;
    userId: string;
    routeId: string;
    attempts: number;
    attemptDate?: Date;
  }>;
  completed: boolean;
};

export type LeaderboardUser = Pick<
  AppUser,
  "id" | "name" | "username" | "image" | "totalXp" | "private"
>;

export type MonthlyLeaderboardEntry = {
  user: LeaderboardUser;
  xp: number;
};
