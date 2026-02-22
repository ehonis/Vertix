import { User, RouteAttempt, RouteCompletion } from "@/generated/prisma/client";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import RouteTile from "./route-tile";
import ElementLoadingAnimation from "../general/element-loading-animation";
import { RouteWithExtraData } from "@/app/api/routes/get-wall-routes-non-archive/route";

interface WallRoutesProps {
  wall: string | null;
  user: User;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    completions: RouteCompletion[],
    attempts: RouteAttempt[],
    userGrade: string | null,
    communityGrade: string,
    xp: { xp: number; baseXp: number; xpExtrapolated: { type: string; xp: number }[] } | null,
    isArchived: boolean,
    bonusXp?: number
  ) => void;
  refreshTrigger?: number;
}

export default function WallRoutes({ wall, user, onData, refreshTrigger }: WallRoutesProps) {
  const { showNotification } = useNotification();
  const [routes, setRoutes] = useState<RouteWithExtraData[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteWithExtraData[]>([]);

  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findRoutes = async () => {
      if (!wall) {
        return;
      }

      const queryData = new URLSearchParams({
        wall: wall,
        page: "1",
        ...(user?.id && { userId: user.id }),
      });
      try {
        const response = await fetch(
          `/api/routes/get-wall-routes-non-archive?${queryData.toString()}`
        );
        if (!response.ok) {
          showNotification({
            message: `Failed to fetch routes for wall: ${wall} (Status: ${response.status})`,
            color: "red",
          });
          return;
        }
        const json = await response.json();
        const data: RouteWithExtraData[] = json.data;

        setRoutes(data);
      } catch (error) {
        showNotification({ message: `Error finding routes for wall : ${wall}`, color: "red" });
      } finally {
        setIsLoading(false);
      }
    };

    findRoutes();
  }, [wall, refreshTrigger]);

  return (
    <div>
      <div className="flex flex-col gap-6">
        {isFiltered && filteredRoutes.length > 0
          ? filteredRoutes.map(route => (
              <RouteTile
                user={user}
                key={route.id}
                color={route.color}
                name={route.title}
                grade={route.grade}
                id={route.id}
                isArchived={route.isArchive}
                isSearched={false}
                onData={onData}
                completions={route.completions}
                attempts={route.attempts}
                communityGrades={route.communityGrades}
                bonusXp={route.bonusXp || 0}
              />
            ))
          : null}

        {isLoading ? (
          <ElementLoadingAnimation />
        ) : !isFiltered && routes && routes.length > 0 ? (
          routes
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map(route => (
              <RouteTile
                user={user}
                key={route.id}
                color={route.color}
                name={route.title}
                grade={route.grade}
                id={route.id}
                isArchived={route.isArchive}
                isSearched={false}
                onData={onData}
                completions={route.completions}
                attempts={route.attempts}
                communityGrades={route.communityGrades}
                bonusXp={route.bonusXp || 0}
              />
            ))
        ) : null}
        {isFiltered && filteredRoutes.length === 0 && (
          <p>No Routes found for this combination of tags and wall</p>
        )}
      </div>
    </div>
  );
}
