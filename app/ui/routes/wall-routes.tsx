import { User, Route } from "@prisma/client";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import RouteTile from "./route-tile";
import ElementLoadingAnimation from "../general/element-loading-animation";

interface WallRoutesProps {
  wall: string | null;
  user: User;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    isCompleted: boolean
  ) => void;
}

export default function WallRoutes({ wall, user, onData }: WallRoutesProps) {
  const { showNotification } = useNotification();
  const [routes, setRoutes] = useState<(Route & { completed: boolean })[]>([]);
  const [page, setPage] = useState(1); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findRoutes = async () => {
      if (!wall) {
        return;
      }

      const queryData = new URLSearchParams({
        wall: wall,
        page: page.toString(),
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
        const data = json.data;
        if (Array.isArray(data)) {
          setRoutes(data);
        } else {
          showNotification({ message: `Invalid data format for wall : ${wall}`, color: "red" });
        }
      } catch (error) {
        showNotification({ message: `Error finding routes for wall : ${wall}`, color: "red" });
      } finally {
        setIsLoading(false);
      }
    };

    findRoutes();
  }, [wall]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="mt-8">
            <ElementLoadingAnimation size={16} />
          </div>
        ) : routes && routes.length > 0 ? (
          routes.map(route => (
            <RouteTile
              key={route.id}
              color={route.color}
              name={route.title}
              grade={route.grade}
              id={route.id}
              isArchived={route.isArchive}
              isSearched={false}
              onData={onData}
              isCompleted={route.completed}
            />
          ))
        ) : (
          <p>No routes found for this wall.</p>
        )}
      </div>
    </div>
  );
}
