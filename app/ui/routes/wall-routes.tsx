import { User, Route } from "@prisma/client";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";

interface WallRoutesProps {
  wall: string | null;
  user: User;
}

export default function WallRoutes({ wall, user }: WallRoutesProps) {
  const { showNotification } = useNotification();
  const [routes, setRoutes] = useState<Route[]>([]); // Initialize as an empty array

  useEffect(() => {
    const findRoutes = async () => {
      if (!wall) {
        return;
      }

      const queryData = new URLSearchParams({
        wall: wall,
      });

      try {
        const response = await fetch(`/api/routes/get-wall-routes?${queryData.toString()}`);
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
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        showNotification({ message: `Error finding routes for wall : ${wall}`, color: "red" });
        console.error("Fetch error:", error);
      }
    };

    findRoutes();
  }, [wall]);

  return (
    <div>
      <div className="flex flex-col gap-1">
        {/* Map over the routes array */}
        {routes && routes.length > 0 ? (
          routes.map(route => (
            <div key={route.id} className="bg-gray-800 rounded p-2">
              {/* Display route information */}
              <p>Route Name: {route.title}</p>
              <p>Grade: {route.grade}</p>
            </div>
          ))
        ) : (
          <p>No routes found for this wall.</p>
        )}
      </div>
    </div>
  );
}
