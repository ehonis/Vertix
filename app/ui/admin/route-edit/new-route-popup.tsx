"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/contexts/NotificationContext";

import { RouteTag, RouteType } from "@/generated/prisma/browser";
import RoutesMapShell from "../../routes/routes-map-shell";
import {
  legacyLocationsForWallPart,
  type LegacyLocationKey,
  type WallPartKey,
} from "@/lib/wallLocations";

import RopeGradeSelect from "../new_route/rope-grade-select";
import BoulderGradeSelect from "../new_route/boulder-grade-select";

export default function NewRoutePopup({ onCancel }: { onCancel: () => void; tags: RouteTag[] }) {
  const [name, setName] = useState("");
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isSecondStep, setIsSecondStep] = useState(false);
  const [type, setType] = useState<RouteType>(RouteType.BOULDER);
  const [selectedDate, setSelectedDate] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [location, setLocation] = useState<LegacyLocationKey>();
  const [color, setColor] = useState("black");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelect = (data: WallPartKey | null) => {
    if (!data) return;
    const routeType =
      data.startsWith("rope") || data.startsWith("AB") ? RouteType.ROPE : RouteType.BOULDER;
    setType(routeType);
    setLocation(legacyLocationsForWallPart(data)[0]);
    setIsFirstStep(false);
    setIsSecondStep(true);
  };

  const handleSecondStepNextClick = () => {
    if (!location) {
      showNotification({ message: "Please select a wall", color: "red" });
      return;
    }
    void handleSubmit();
  };

  const handleSecondStepBackClick = () => {
    setIsSecondStep(false);
    setIsFirstStep(true);
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/routes/edit/add-route", {
        method: "POST",
        body: JSON.stringify({
          newRoute: {
            title: name,
            color: color,
            grade: grade,
            date: selectedDate,
            location: location,
            type: type,
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
                <RoutesMapShell onData={handleLocationSelect} />
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
        </motion.div>
      </motion.div>
    </div>
  );
}
