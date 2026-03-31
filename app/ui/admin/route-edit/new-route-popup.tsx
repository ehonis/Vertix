"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";

import { useNotification } from "@/app/contexts/NotificationContext";
import { api } from "@/convex/_generated/api";
import RoutesMapShell from "../../routes/routes-map-shell";
import {
  legacyLocationsForWallPart,
  type LegacyLocationKey,
  type WallPartKey,
} from "@/lib/wallLocations";
import RopeGradeSelect from "../new_route/rope-grade-select";
import BoulderGradeSelect from "../new_route/boulder-grade-select";

type RouteType = "BOULDER" | "ROPE";

const ROUTE_TYPE = {
  BOULDER: "BOULDER" as RouteType,
  ROPE: "ROPE" as RouteType,
};

type PreviewRoute = {
  id: string;
  title: string;
  grade: string;
  color: string;
  order: number | null;
  isNew?: boolean;
};

export default function NewRoutePopup({
  onCancel,
}: {
  onCancel: () => void;
  tags: Array<{ name: string }>;
}) {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<RouteType>(ROUTE_TYPE.BOULDER);
  const [selectedDate, setSelectedDate] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [location, setLocation] = useState<LegacyLocationKey>();
  const [color, setColor] = useState("black");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newRouteOrder, setNewRouteOrder] = useState<number>(0);

  const convexWallRoutes = useQuery(
    api.routes.getWallRoutes,
    location ? { wallPart: location } : "skip"
  );

  const existingRoutes = useMemo(() => {
    return [...(convexWallRoutes?.routes ?? [])].sort((a, b) => {
      const aOrder = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
      const bOrder = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return a.title.localeCompare(b.title);
    });
  }, [convexWallRoutes?.routes]);

  useEffect(() => {
    setNewRouteOrder(0);
  }, [existingRoutes.length, location]);

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    setIsToday(selectedDate === formattedDate);
  }, [selectedDate]);

  const previewRoutes = useMemo<PreviewRoute[]>(() => {
    const normalizedExisting: PreviewRoute[] = existingRoutes.map((route, index) => ({
      id: route.convexId,
      title: route.title,
      grade: route.grade,
      color: route.color,
      order: index,
    }));

    const insertAt = Math.max(0, Math.min(newRouteOrder, normalizedExisting.length));
    const nextRoutes = [...normalizedExisting];

    nextRoutes.splice(insertAt, 0, {
      id: "new-route-preview",
      title: name || "New Route",
      grade: grade || "Unset grade",
      color,
      order: insertAt,
      isNew: true,
    });

    return nextRoutes.map((route, index) => ({
      ...route,
      order: index,
    }));
  }, [color, existingRoutes, grade, name, newRouteOrder]);

  const selectedPreviewIndex = previewRoutes.findIndex(route => route.isNew);

  const handleLocationSelect = (data: WallPartKey | null) => {
    if (!data) {
      return;
    }

    const routeType =
      data.startsWith("rope") || data.startsWith("AB") ? ROUTE_TYPE.ROPE : ROUTE_TYPE.BOULDER;
    setType(routeType);
    setLocation(legacyLocationsForWallPart(data)[0]);
    setStep(2);
  };

  const handleNowButton = () => {
    const date = new Date();
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleSecondStepNextClick = () => {
    if (!location) {
      showNotification({ message: "Please select a wall", color: "red" });
      return;
    }

    if (!name || !color || !grade || !selectedDate) {
      showNotification({ message: "Complete all route details first", color: "red" });
      return;
    }

    setStep(3);
  };

  const movePreviewRoute = (direction: "up" | "down") => {
    setNewRouteOrder(currentOrder => {
      if (direction === "up") {
        return Math.max(0, currentOrder - 1);
      }

      return Math.min(existingRoutes.length, currentOrder + 1);
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/routes/edit/add-route", {
        method: "POST",
        body: JSON.stringify({
          newRoute: {
            title: name,
            color,
            grade,
            date: selectedDate,
            location,
            type,
            order: newRouteOrder,
          },
        }),
      });

      if (response.ok) {
        showNotification({ message: "Route added successfully", color: "green" });
        router.refresh();
        onCancel();
      } else {
        showNotification({ message: "Error adding route", color: "red" });
      }
    } catch (error) {
      console.error("Error submitting route:", error);
      showNotification({ message: "Error adding route", color: "red" });
    } finally {
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
        className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            "relative flex w-full max-w-md flex-col gap-3 rounded-lg bg-slate-900/85 p-4 text-white shadow-lg outline",
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
          <button className="absolute right-2 top-2" onClick={onCancel}>
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

          <div>
            <h1 className="text-xl font-barlow font-bold">New Route</h1>
            <p className="text-sm text-white/60">Step {step} of 3</p>
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-2">
              <p className="text-white">Select a Wall</p>
              <div className="pl-2">
                <RoutesMapShell onData={handleLocationSelect} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                className="rounded bg-slate-950 px-2 py-1 font-barlow text-xl font-bold focus:outline-none"
                value={name}
                autoCapitalize="sentences"
                onChange={e => setName(e.target.value)}
              />

              <div className="flex items-center justify-between gap-2">
                <label className="text-lg font-barlow font-bold text-white">Color & Grade:</label>
                <div className="flex items-center gap-2">
                  <select
                    name="color"
                    id="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="rounded-sm bg-slate-950 px-2 py-1 text-lg font-barlow font-bold text-white"
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

              <div className="flex items-center justify-between gap-2">
                <label className="text-lg font-barlow font-bold text-white">Set Date:</label>
                <div className="flex items-center gap-2">
                  <button
                    className={clsx(
                      "rounded-lg px-2 py-1 font-barlow font-bold text-white",
                      isToday ? "bg-green-500" : "bg-slate-950"
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
                    onChange={e => setSelectedDate(e.target.value)}
                    className="cursor-pointer rounded-lg bg-slate-950 p-1 font-barlow font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-between">
                <button
                  className="flex items-center rounded bg-gray-400 px-2 py-1 text-lg font-semibold font-barlow"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  className="flex items-center rounded bg-blue-500 px-2 py-1 text-lg font-semibold font-barlow disabled:opacity-50"
                  onClick={handleSecondStepNextClick}
                  disabled={!name || !color || !grade || !selectedDate}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded bg-slate-800 px-3 py-1 font-barlow font-semibold"
                  onClick={() => setNewRouteOrder(0)}
                >
                  Place beginning
                </button>
                <button
                  className="rounded bg-slate-800 px-3 py-1 font-barlow font-semibold"
                  onClick={() => setNewRouteOrder(existingRoutes.length)}
                >
                  Place end
                </button>
                <button
                  className="rounded bg-slate-800 px-3 py-1 font-barlow font-semibold disabled:opacity-50"
                  onClick={() => movePreviewRoute("up")}
                  disabled={selectedPreviewIndex <= 0}
                >
                  Move up
                </button>
                <button
                  className="rounded bg-slate-800 px-3 py-1 font-barlow font-semibold disabled:opacity-50"
                  onClick={() => movePreviewRoute("down")}
                  disabled={
                    selectedPreviewIndex === -1 || selectedPreviewIndex >= previewRoutes.length - 1
                  }
                >
                  Move down
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-md bg-slate-950/80 p-2">
                <div className="flex flex-col gap-2">
                  {previewRoutes.map(route => (
                    <div
                      key={route.id}
                      className={clsx(
                        "flex items-center justify-between rounded-md border px-3 py-2",
                        route.color === "green" && "border-green-500/60 bg-green-500/25",
                        route.color === "blue" && "border-blue-500/60 bg-blue-500/25",
                        route.color === "red" && "border-red-500/60 bg-red-500/25",
                        route.color === "yellow" && "border-yellow-500/60 bg-yellow-500/25",
                        route.color === "purple" && "border-purple-500/60 bg-purple-500/25",
                        route.color === "orange" && "border-orange-500/60 bg-orange-500/25",
                        route.color === "pink" && "border-pink-500/60 bg-pink-500/25",
                        route.color === "gray" && "border-gray-500/60 bg-gray-500/25",
                        route.color === "white" && "border-white/60 bg-white/25",
                        route.color === "black" && "border-white/20 bg-black/40",
                        route.color === "brown" && "border-amber-800/60 bg-amber-950/40",
                        route.isNew && "ring-2 ring-blue-400"
                      )}
                    >
                      <div>
                        <p className="font-barlow font-bold">{route.title}</p>
                        <p className="text-xs text-white/60">{route.grade}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">#{route.order ?? "-"}</p>
                        {route.isNew && <p className="text-xs text-blue-200">New route</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  className="flex items-center rounded bg-gray-400 px-2 py-1 text-lg font-semibold font-barlow"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button
                  className="flex items-center rounded bg-green-600 px-3 py-1 text-lg font-semibold font-barlow disabled:opacity-50"
                  onClick={() => void handleSubmit()}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Create Route"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
