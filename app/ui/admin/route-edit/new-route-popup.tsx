"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/contexts/NotificationContext";

import TopDown from "../../routes/topdown";
import { Locations, Route, RouteTag, RouteType } from "@prisma/client";

import RopeGradeSelect from "../new_route/rope-grade-select";
import BoulderGradeSelect from "../new_route/boulder-grade-select";
import { v4 as uuidv4 } from "uuid";

// Type for the transformed route data used in sorting and filtering
export type TransformedRoute = {
  id: string;
  name: string;
  order: number;
};

export default function NewRoutePopup({
  onCancel,
  tags,
}: {
  onCancel: () => void;
  tags: RouteTag[];
}) {
  const [name, setName] = useState("");
  const router = useRouter();
  const { showNotification } = useNotification();
  const [tempTags, setTempTags] = useState<string[]>(tags.map(tag => tag.name));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isSecondStep, setIsSecondStep] = useState(false);
  const [isThirdStep, setIsThirdStep] = useState(false);
  const [type, setType] = useState<RouteType>(RouteType.BOULDER);
  const [selectedDate, setSelectedDate] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [id, setId] = useState("");
  const [location, setLocation] = useState<Locations>();
  const [color, setColor] = useState("black");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [routes, setRoutes] = useState<Route[]>([]);

  const findRoutesFromLocation = async (location: Locations) => {
    try {
      const response = await fetch(`/api/routes/get-wall-routes-non-archive?wall=${location}`);
      const data = await response.json();
      setRoutes(data.data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setRoutes([]);
    }
  };

  useEffect(() => {
    console.log("location", location);
    if (location) {
      findRoutesFromLocation(location);
    }
  }, [location]);

  const handleLocationSelect = (data: Locations | null) => {
    if (!data) return;
    const routeType =
      data.startsWith("rope") || data.startsWith("AB") ? RouteType.ROPE : RouteType.BOULDER;
    setType(routeType);
    setLocation(data);
    setIsFirstStep(false);
    setIsThirdStep(false);
    setIsSecondStep(true);
  };

  const handleFirstStepNextClick = () => {
    setIsFirstStep(false);
    setIsThirdStep(false);
    setIsSecondStep(true);
  };

  const handleSecondStepNextClick = () => {
    const newId = uuidv4();
    setId(newId);
    if (!location) {
      showNotification({ message: "Please select a wall", color: "red" });
      return;
    }
    setRoutes([
      {
        id: newId,
        title: name,
        color: color,
        grade: grade,
        setDate: new Date(selectedDate),
        order: -1,
        location: location,
        type: type,
        isArchive: false,
        createdByUserID: null,
        xp: 0,
        bonusXp: 0,
      },
      ...routes,
    ]);
    setIsSecondStep(false);
    setIsFirstStep(false);
    setIsThirdStep(true);
  };

  const handleSecondStepBackClick = () => {
    setIsSecondStep(false);
    setIsFirstStep(true);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleNowButton = () => {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];

    if (selectedDate === formattedDate) {
      setIsToday(true);
    } else if (selectedDate !== formattedDate) {
      setIsToday(false);
    }
  }, [selectedDate]);

  const handleThirdStepBackClick = () => {
    setIsSecondStep(true);
    setIsFirstStep(false);
    setIsThirdStep(false);
  };

  const handleMoveUp = () => {
    const currentRoute = routes.find(route => route.id === id);
    if (!currentRoute || currentRoute.order === null) return;
    const currentOrder = currentRoute.order;

    const newRoutes = routes.map(route => {
      if (route.id === id) {
        return { ...route, order: (route.order ?? 0) - 1 };
      }
      if (route.order === currentOrder - 1) {
        return { ...route, order: (route.order ?? 0) + 1 };
      }
      return route;
    });
    setRoutes(newRoutes);
  };

  const handleMoveDown = () => {
    const currentRoute = routes.find(route => route.id === id);
    if (!currentRoute || currentRoute.order === null) return;
    const currentOrder = currentRoute.order;

    const newRoutes = routes.map(route => {
      if (route.id === id) {
        return { ...route, order: (route.order ?? 0) + 1 };
      }
      if (route.order === currentOrder + 1) {
        return { ...route, order: (route.order ?? 0) - 1 };
      }
      return route;
    });
    setRoutes(newRoutes);
  };

  const removeAttribuitesAndSortByOrder = (routes: Route[]): TransformedRoute[] => {
    const removedAttribuites = routes.map(route => {
      return {
        id: route.id,
        name: route.title,
        order: route.order ?? 0,
      };
    });
    const addOneToOrder = removedAttribuites.map((route, index) => {
      return { ...route, order: index };
    });
    const sortedByOrder = addOneToOrder.sort((a, b) => a.order - b.order);
    return sortedByOrder;
  };

  const removeUnchangedOrder = (
    routes: TransformedRoute[],
    orderNumber: number
  ): TransformedRoute[] => {
    const changedRoutes = routes.filter(route => route.order >= orderNumber + 1);
    return changedRoutes;
  };

  const handleSubmit = async () => {
    const filteredRoutes = removeAttribuitesAndSortByOrder(routes);
    const foundRoute = filteredRoutes.find(route => route.id === id);
    const routeOrderNumber = foundRoute?.order;
    const routesToChange = removeUnchangedOrder(filteredRoutes, routeOrderNumber || 0);
    setIsLoading(true);
    try {
      const response = await fetch("/api/routes/edit/add-route", {
        method: "POST",
        body: JSON.stringify({
          newRoute: {
            id: id,
            title: name,
            color: color,
            grade: grade,
            date: selectedDate,
            order: routeOrderNumber,
            location: location,
            type: type,
          },
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({ message: "Route added successfully", color: "green" });
        onCancel();
      } else {
        showNotification({ message: "Error adding route", color: "red" });
      }
    } catch (error) {
      console.error("Error submitting route:", error);
    }

    try {
      const response = await fetch("/api/routes/edit/update-routes", {
        method: "PATCH",
        body: JSON.stringify({
          routesToChange: routesToChange,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({ message: "Route updated successfully", color: "green" });
        router.refresh();
        onCancel();
        setIsLoading(false);
      } else {
        showNotification({ message: "Error updating route", color: "red" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error submitting route:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            "bg-slate-900/35 outline p-2 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2",
            {
              "outline-green-400": color === "green",
              "outline-red-400": color === "red",
              "outline-blue-400": color === "blue",
              "outline-yellow-400": color === "yellow",
              "outline-purple-400": color === "purple",
              "outline-orange-400": color === "orange",
              "outline-white": color === "white",
              "outline-black": color === "black",
              "outline-pink-400": color === "pink",
              "outline-amber-950": color === "brown",
            }
          )}
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl font-barlow font-bold">New Route</h1>
          {isFirstStep && (
            <div className="">
              <p className="text-white">Select a Wall</p>
              <div className="pl-2">
                <TopDown onData={handleLocationSelect} />
              </div>
            </div>
          )}
          {isSecondStep && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                className="bg-slate-900 rounded font-barlow text-xl px-2 py-1 focus:outline-none font-bold"
                value={name}
                autoCapitalize="sentences"
                onChange={e => setName(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <label htmlFor="" className="text-white font-barlow font-bold text-lg">
                  Color & Grade:
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    name="color"
                    id="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="bg-slate-900 text-white font-barlow font-bold px-2 py-1 rounded-sm text-lg"
                  >
                    <option value=""></option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="brown">Brown</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="orange">Orange</option>
                    <option value="pink">Pink</option>
                    <option value="purple">Purple</option>
                  </select>
                  {type === "ROPE" ? (
                    <RopeGradeSelect onGradeChange={setGrade} />
                  ) : (
                    <BoulderGradeSelect onGradeChange={setGrade} />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="" className="text-white font-barlow font-bold text-lg">
                  Set Date:
                </label>
                <div className="flex gap-2 items-center">
                  <button
                    className={clsx(
                      "font-barlow font-bold px-2 py-1 rounded-lg  text-white",
                      isToday ? "bg-green-500" : "bg-slate-900"
                    )}
                    onClick={handleNowButton}
                  >
                    Today
                  </button>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="p-1 rounded-lg bg-slate-900 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-between w-full mt-3">
                <button
                  className="rounded bg-gray-400 font-barlow px-2 py-1 text-lg font-semibold items-center flex"
                  onClick={handleSecondStepBackClick}
                >
                  ← Back
                </button>
                {name !== "" && color !== "" && grade !== "" && selectedDate !== "" && (
                  <button
                    className="rounded bg-blue-500 font-barlow px-2 py-1 text-lg font-semibold items-center flex"
                    onClick={handleSecondStepNextClick}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}
          {isThirdStep && (
            <div className="flex flex-col gap-3">
              <p className="text-white font-barlow font-bold text-lg">Sort Route {"(L → R)"}</p>
              <div className="flex flex-col gap-2 overflow-y-scroll h-96 p-2">
                {Array.isArray(routes) &&
                  routes
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map(route => (
                      <div key={route.id} className="flex gap-2 items-center">
                        <div
                          className={clsx("flex w-full rounded-md p-2 outline-2", {
                            "outline-green-400": route.color === "green",
                            "outline-red-400": route.color === "red",
                            "outline-blue-400": route.color === "blue",
                            "outline-yellow-400": route.color === "yellow",
                            "outline-purple-400": route.color === "purple",
                            "outline-orange-400": route.color === "orange",
                            "outline-white": route.color === "white",
                            "outline-black": route.color === "black",
                            "outline-pink-400": route.color === "pink",
                            "outline-amber-950": route.color === "brown",
                          })}
                        >
                          <div>
                            <p className="text-white font-barlow font-bold text-lg">
                              {route.title}
                            </p>
                            <p className="text-white font-barlow font-bold text-lg">
                              {route.grade}
                            </p>
                          </div>
                        </div>
                        <div
                          className={clsx("flex flex-col justify-between h-full py-1 ", {
                            "justify-end": route.order === -1,
                          })}
                        >
                          {route.order !== -1 && route.id === id && (
                            <button
                              className="flex bg-gray-600 items-center justify-center rounded "
                              onClick={() => handleMoveUp()}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-7 stroke-2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                />
                              </svg>
                            </button>
                          )}
                          {route.order !== routes.length - 2 && route.id === id && (
                            <button
                              className="flex bg-gray-600 items-center justify-center justify-self-end rounded"
                              onClick={() => handleMoveDown()}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-7 stroke-2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
              <div className="flex w-full justify-between mt-3">
                <button
                  className="rounded bg-gray-400 font-barlow px-2 py-1 text-lg font-semibold items-center flex"
                  onClick={handleThirdStepBackClick}
                >
                  ← Back
                </button>
                <button
                  className="rounded bg-green-500 font-barlow px-2 py-1 text-lg font-semibold items-center flex"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
