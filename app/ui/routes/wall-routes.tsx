import { User, Route, RouteTag } from "@prisma/client";
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
  selectedTags: string[];
}

export default function WallRoutes({ wall, user, onData, selectedTags }: WallRoutesProps) {
  const { showNotification } = useNotification();
  const [routes, setRoutes] = useState<(Route & { completed: boolean; tags: RouteTag[] })[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<
    (Route & { completed: boolean; tags: RouteTag[] })[]
  >([]);

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
        const data: (Route & { completed: boolean; tags: RouteTag[] })[] = json.data;
        if (Array.isArray(data)) {
          if (selectedTags.length > 0) {
            const filteredRoutes = data.filter(route =>
              selectedTags.some(tag => route.tags.some(t => t.name === tag))
            );
            setIsFiltered(true);
            setFilteredRoutes(filteredRoutes);
            setRoutes(data);
          } else {
            setIsFiltered(false);
            setFilteredRoutes([]);
            setRoutes(data);
          }
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

  useEffect(() => {
    if (selectedTags.length > 0) {
      const filteredRoutes = routes.filter(route =>
        selectedTags.some(tag => route.tags.some(t => t.name === tag))
      );
      setIsFiltered(true);
      setFilteredRoutes(filteredRoutes);
    } else {
      setIsFiltered(false);
      setFilteredRoutes([]);
    }
  }, [selectedTags]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        {isFiltered && filteredRoutes.length > 0
          ? filteredRoutes.map(route => (
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
          : null}

        {isLoading ? (
          <ElementLoadingAnimation />
        ) : !isFiltered && routes && routes.length > 0 ? (
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
        ) : null}
        {isFiltered && filteredRoutes.length === 0 && (
          <p>No Routes found for this combination of tags and wall</p>
        )}
      </div>
    </div>
  );
}
