"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatMultipleRoutesNotCalculated } from "@/lib/mixer";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";

type NewRoutePopUpProps = {
  onCancel: () => void;
  compId: string;
};

type routeData = {
  name: string;
  color: string;
  holds: number;
};

const ROUTENAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function NewRoutePopUp({ onCancel, compId }: NewRoutePopUpProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [amountOfRoutes, setAmountOfroutes] = useState<number>(0);
  const [isAmountSave, setIsAmountSave] = useState(false);
  const [isRouteInformation, setIsRouteInformation] = useState(false);
  const [isAutoCalculateScores, setIsAutoCalculateScores] = useState(false);
  const [routes, setRoutes] = useState<routeData[]>([]);

  const decrementAmountOfRoutes = () => {
    if (amountOfRoutes === 0) {
      return;
    } else {
      setAmountOfroutes(amountOfRoutes - 1);
    }
  };
  const incrementAmountOfRoutes = () => {
    if (amountOfRoutes === 10) {
      return;
    } else {
      setAmountOfroutes(amountOfRoutes + 1);
    }
  };
  useEffect(() => {
    if (amountOfRoutes !== 0) {
      setIsAmountSave(true);
    } else {
      setIsAmountSave(false);
    }
  }, [amountOfRoutes]);

  const initializeRoutes = () => {
    const tempArray = ROUTENAMES.slice(0, amountOfRoutes);
    const tempRoutes: routeData[] = tempArray.map(name => ({
      name,
      color: "red",
      holds: 0,
    }));

    setRoutes(tempRoutes);
  };

  const handleColorChange = (index: number, newColor: string) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = { ...updatedRoutes[index], color: newColor };
    setRoutes(updatedRoutes);
  };
  const handleHoldsChange = (index: number, newHolds: number) => {
    if (newHolds > 40) {
      return;
    } else if (newHolds < 0) {
      return;
    } else {
      const updatedRoutes = [...routes];
      updatedRoutes[index] = { ...updatedRoutes[index], holds: newHolds };
      setRoutes(updatedRoutes);
    }
  };

  const handleAddMultipleRoutes = async () => {
    if (isAutoCalculateScores) {
      showNotification({ message: "Auto Calculate is not supported at this time", color: "red" });
    } else {
      const result = formatMultipleRoutesNotCalculated(routes, compId);
      const data = { routeData: result };

      try {
        const response = await fetch("/api/mixer/manager/route/addRoutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          showNotification({ message: "could not add routes", color: "red" });
        } else {
          showNotification({
            message: `Successfully added ${result.length} routes`,
            color: "green",
          });
        }
        router.refresh();
        onCancel();
      } catch (error) {
        showNotification({ message: "could not add routes", color: "red" });
      }
    }
  };
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
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
          <h2 className="text-xl">New Route</h2>

          {!isRouteInformation ? (
            <div className="flex flex-col gap-3 items-center">
              {/* if the user picked all routes */}
              <p className="font-normal">How many routes are you adding?</p>
              <div className="flex gap-10 items-center">
                <button
                  className="rounded-full bg-red-500 p-1 "
                  onClick={() => decrementAmountOfRoutes()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 stroke-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <p className="text-3xl">{amountOfRoutes}</p>
                <button
                  className="rounded-full bg-green-500 p-1 "
                  onClick={() => incrementAmountOfRoutes()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-10 stroke-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
              {isAmountSave && (
                <button
                  className="mt-8 text-2xl "
                  onClick={() => {
                    initializeRoutes();
                    setIsRouteInformation(true);
                  }}
                >
                  Next {"→"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* if the user has picked many routes and inputted how many routes they wanted */}
              <p>Route Information</p>
              <div className="h-72 overflow-hidden overflow-y-auto flex flex-col gap-2">
                {routes.map((route, index) => (
                  <div className="flex flex-col gap-1" key={index}>
                    <div className="p-2 bg-slate-700 rounded">
                      <p>{route.name}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <label htmlFor="">Color:</label>
                          <select
                            name=""
                            id=""
                            className="bg-bg1 px-2 p-1 rounded"
                            value={route.color}
                            onChange={e => handleColorChange(index, e.target.value)} // Corrected onChange handler
                          >
                            <option value="red">red</option>
                            <option value="blue">blue</option>
                            <option value="green">green</option>
                            <option value="yellow">yellow</option>
                            <option value="purple">purple</option>
                            <option value="white">white</option>
                            <option value="black">black</option>
                            <option value="pink">pink</option>
                            <option value="orange">orange</option>
                          </select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label htmlFor="">Holds</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name=""
                            id=""
                            value={route.holds}
                            onChange={e => handleHoldsChange(index, Number(e.target.value))}
                            className="bg-bg1 w-16 p-1 rounded "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-0.5 rounded w-full bg-white" />
              <div className="flex justify-between items-center bg-slate-700 p-2 rounded">
                <p className="font-normal">Auto calculate scores?</p>
                <input
                  type="checkbox"
                  checked={isAutoCalculateScores}
                  onChange={() => setIsAutoCalculateScores(!isAutoCalculateScores)}
                />
              </div>
              <div className="justify-end w-full">
                <button
                  className="p-2 rounded bg-green-400"
                  onClick={() => handleAddMultipleRoutes()}
                >
                  Add Routes
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
