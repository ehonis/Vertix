'use client';
import { useEffect, useState } from 'react';
import EditRoutePopUp from './mixer-edit-route-popup';
import { clsx } from 'clsx';

export default function RoutesComponent({ routes }) {
  const [compRoutes, setCompRoutes] = useState(
    routes.map((route) => ({
      ...route,
      holds: JSON.parse(route.holds), // Convert holds JSON string to array
    }))
  ); // route
  const [isEditRoutePopup, setIsEditRoutePopup] = useState(false); //route
  const [isNewEditRoutePopUp, setIsNewEditRoutePopup] = useState(false); //route
  const [tempHolds, setTempHolds] = useState([]); //route
  const [tempRouteId, setTempRouteId] = useState(null); //route
  const [tempRouteName, setTempRouteName] = useState(''); //route

  const handleEditRoutePopUp = (id) => {
    const tempRoute = compRoutes.find((route) => route.id === id);

    if (tempRoute) {
      setTempHolds(tempRoute.holds);
      setTempRouteId(tempRoute.id);
      setTempRouteName(tempRoute.name);
      setIsEditRoutePopup(true);
    } else {
      console.error(`Route with ID ${id} not found`);
    }
  }; //route

  const updateRouteHolds = (routeId, newHolds, newName) => {
    setCompRoutes((prevRoutes) =>
      prevRoutes.map((route) =>
        route.id === routeId
          ? { ...route, holds: newHolds, name: newName }
          : route
      )
    );
  }; //route
  return (
    <div>
      {isNewEditRoutePopUp && (
        <EditRoutePopUp
          onCancel={() => setIsNewEditRoutePopup(false)}
          holds={null}
        />
      )}
      {isEditRoutePopup && (
        <EditRoutePopUp
          onCancel={() => setIsEditRoutePopup(false)}
          holds={tempHolds}
          routeName={tempRouteName}
          routeId={tempRouteId}
          updateRouteHolds={updateRouteHolds}
        />
      )}
      <div>
        <h3 className="text-3xl mt-3">Routes</h3>
        <div className="bg-bg2 flex-col gap-2 flex p-3 rounded-sm w-full">
          {compRoutes.length > 0 ? (
            <div className="w-full flex-col flex gap-2">
              {compRoutes.map((route) => (
                <button
                  key={route.id}
                  className={clsx(
                    ' flex p-1 rounded-sm',
                    route.color === 'red' && 'bg-red-500',
                    route.color === 'blue' && 'bg-blue-500',
                    route.color === 'green' && 'bg-green-400',
                    route.color === 'orange' && 'bg-orange-500',
                    route.color === 'yellow' && 'bg-yellow-500'
                  )}
                  onClick={() => handleEditRoutePopUp(route.id)}
                >
                  <div className="grid bg-bg1 grid-cols-2 items-center p-1 px-2 w-full rounded-sm">
                    <p className="text-xl place-self-start">{route.name}</p>
                    <p className="text-xl place-self-end">
                      Holds: {route.holds.length}
                    </p>
                  </div>
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
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
