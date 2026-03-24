import type { MonthlyLeaderboardEntry } from "@/lib/appTypes";

export type TVSlideType = "LOGO" | "STATS" | "LEADERBOARD" | "FEATURED_ROUTE" | "IMAGE" | "TEXT";

export type TVRouteImage = {
  id: string;
  url: string;
  sortOrder: number | null;
};

export type TVRoute = {
  id: string;
  title: string;
  grade: string;
  color: string;
  type: "BOULDER" | "ROPE";
  setDate: Date;
  bonusXp: number | null;
  images: TVRouteImage[];
};

export type TVSlide = {
  id: string;
  type: TVSlideType;
  imageUrl: string | null;
  text: string | null;
  isActive: boolean;
  sortOrder: number | null;
  routes: TVRoute[];
};

export type TVData = {
  slides: TVSlide[];
  monthlyLeaderBoardData: MonthlyLeaderboardEntry[];
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
};
