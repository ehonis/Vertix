import { User, Route, RouteTag } from "@prisma/client";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import RouteTile from "./route-tile";
import ElementLoadingAnimation from "../general/element-loading-animation";

interface WallRoutesProps {
  user: User;
  onData: (
    routeId: string,
    name: string,
    grade: string,
    color: string,
    isCompleted: boolean
  ) => void;
  selectedTags: string[];
}

export default function TagRoutes({ user, onData, selectedTags }: WallRoutesProps) {
  const { showNotification } = useNotification();
  const [routes, setRoutes] = useState<(Route & { completed: boolean; tags: RouteTag[] })[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const findRoutes = async () => {
      if (!selectedTags) {
        return;
      }

      const queryData = new URLSearchParams({
        tags: selectedTags.toString(),
        page: "1",
        ...(user?.id && { userId: user.id }),
      });
      try {
        const response = await fetch(
          `/api/routes/get-tag-routes-non-archive?${queryData.toString()}`
        );
        if (!response.ok) {
          showNotification({
            message: `Failed to fetch routes for wall: ${selectedTags.toString()} (Status: ${response.status})`,
            color: "red",
          });
          return;
        }
        const json = await response.json();
        const data: (Route & { completed: boolean; tags: RouteTag[] })[] = json.data;
        if (Array.isArray(data)) {
          setRoutes(data);
        } else {
          showNotification({
            message: `Invalid data format for wall : ${selectedTags.toString()}`,
            color: "red",
          });
        }
      } catch (error) {
        showNotification({
          message: `Error finding routes for wall : ${selectedTags.toString()}`,
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    findRoutes();
  }, [selectedTags]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <ElementLoadingAnimation />
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
          <p className="text-center text-gray-500">No routes found</p>
        )}
      </div>
    </div>
  );
}
