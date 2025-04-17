"use client";
import { useEffect, useState } from "react";
import EditRoutePopUp from "./mixer-edit-route-popup";
import NewRoutePopUp from "./new-route-popop";
import { clsx } from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { MixerRoute } from "@prisma/client";

type holdData = {
  topRopePoints: number;
  leadPoints: number;
  holdNumber: number;
};

type RoutesComponentData = {
  routes: MixerRoute[];
  compId: string;
};
export default function RoutesComponent({ routes, compId }: RoutesComponentData) {
  const { showNotification } = useNotification();
  const [compRoutes, setCompRoutes] = useState(
    routes.map(route => ({
      ...route,
      holds: JSON.parse(route.holds as string), // Convert holds JSON string to array
    }))
  ); // route
  const [isEditRoutePopup, setIsEditRoutePopup] = useState(false); //route
  const [isNewEditRoutePopUp, setIsNewEditRoutePopup] = useState(false); //route
  const [tempHolds, setTempHolds] = useState<holdData[]>([]); //route
  const [tempRouteId, setTempRouteId] = useState(""); //route
  const [tempRouteName, setTempRouteName] = useState(""); //route
  const [tempRouteColor, setTempRouteColor] = useState("");

  const handleEditRoutePopUp = (id: string) => {
    const tempRoute = compRoutes.find(route => route.id === id);

    if (tempRoute) {
      setTempHolds(tempRoute.holds);
      setTempRouteId(tempRoute.id);
      setTempRouteName(tempRoute.name);
      setTempRouteColor(tempRoute.color);
      setIsEditRoutePopup(true);
    } else {
      console.error(`Route with ID ${id} not found`);
    }
  }; //route

  const updateRouteHolds = async (
    routeId: string,
    newHolds: object,
    newName: string,
    newColor: string
  ) => {
    setCompRoutes(prevRoutes =>
      prevRoutes.map(route =>
        route.id === routeId ? { ...route, holds: newHolds, name: newName, color: newColor } : route
      )
    );
    try {
      const data = {
        routeId,
        newHolds,
        newName,
        newColor,
        compId,
      };

      const response = await fetch("/api/mixer/manager/route/update-route-holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "response was not okay, could not updated route holds and/or name",
          color: "red",
        });
      } else {
        showNotification({
          message: "succesfully updated route holds and/or name",
          color: "green",
        });
      }
    } catch (error) {
      showNotification({
        message: "response was not okay, could not updated route holds and/or name",
        color: "red",
      });
    }
  }; //route

  useEffect(() => {
    setCompRoutes(
      routes.map(route => ({
        ...route,
        holds: JSON.parse(route.holds as string), // Convert holds JSON string to array
      }))
    );
  }, [routes]);

  return (
    <div>
      {isNewEditRoutePopUp && (
        <NewRoutePopUp onCancel={() => setIsNewEditRoutePopup(false)} compId={compId} />
      )}
      {isEditRoutePopup && (
        <EditRoutePopUp
          onCancel={() => setIsEditRoutePopup(false)}
          holds={tempHolds}
          routeName={tempRouteName}
          routeId={tempRouteId}
          updateRouteHolds={updateRouteHolds}
          routeColor={tempRouteColor}
        />
      )}
      <div className="md:w-48">
        <h3 className="text-3xl mt-3">Routes</h3>
        <div className="bg-slate-900 flex-col gap-2 flex p-3 rounded-sm w-full">
          {compRoutes.length > 0 ? (
            <div className="w-full flex-col flex gap-2">
              {compRoutes.map(route => (
                <button
                  key={route.id}
                  className={clsx(
                    " flex rounded-sm justify-between p-2",
                    route.color === "red" && "bg-red-500/25 outline outline-red-500",
                    route.color === "blue" && "bg-blue-500/25 outline outline-blue-500",
                    route.color === "green" && "bg-green-400/25 outline outline-green-400",
                    route.color === "orange" && "bg-orange-500/25 outline outline-orange-500",
                    route.color === "yellow" && "bg-yellow-500/25 outline outline-yellow-500",
                    route.color === "pink" && "bg-pink-400/25 outline outline-pink-400",
                    route.color === "purple" && "bg-purple-600/25 outline outline-purple-600",
                    route.color === "white" && "bg-white/25 outline outline-white",
                    route.color === "black" && "bg-black/25 outline outline-white"
                  )}
                  onClick={() => handleEditRoutePopUp(route.id)}
                >
                  <p className="text-xl place-self-start">{route.name}</p>
                  <p className="text-xl place-self-end">Holds: {route.holds.length}</p>
                </button>
              ))}
              <div className="flex items-center gap-1">
                <button
                  className="bg-green-400 p-1 rounded-full max-w-fit"
                  onClick={() => setIsNewEditRoutePopup(!isNewEditRoutePopUp)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-7 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
                <p className="font-medium">Add Route</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1">
                <button
                  className="bg-green-400 p-1 rounded-full max-w-fit"
                  onClick={() => setIsNewEditRoutePopup(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-7 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
                <p className="font-medium">Add Route</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
