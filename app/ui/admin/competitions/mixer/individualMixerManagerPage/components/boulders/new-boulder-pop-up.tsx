"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import BoulderGradeSelect from "@/app/ui/admin/new_route/boulder-grade-select";

type NewRoutePopUpProps = {
  onCancel: () => void;
  compId: string;
};

type boulderData = {
  points: number;
  color: string;
  competitionId: string;
  grade: string;
};

export default function NewBoulderPopUp({ onCancel, compId }: NewRoutePopUpProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [amountOfBoulders, setAmountOfBoulders] = useState<number>(0);
  const [isAmountSave, setIsAmountSave] = useState(false);
  const [isBoulderInformation, setIsBoulderInformation] = useState(false);
  const [boulders, setBoulders] = useState<boulderData[]>([]);

  const decrementAmountOfBoulders = () => {
    if (amountOfBoulders === 0) {
      return;
    } else {
      setAmountOfBoulders(amountOfBoulders - 1);
    }
  };
  const incrementAmountOfBoulders = () => {
    if (amountOfBoulders === 30) {
      return;
    } else {
      setAmountOfBoulders(amountOfBoulders + 1);
    }
  };
  useEffect(() => {
    if (amountOfBoulders !== 0) {
      setIsAmountSave(true);
    } else {
      setIsAmountSave(false);
    }
  }, [amountOfBoulders]);

  const initializeBoulders = () => {
    let pointValue = 100;
    const emptyBoulderArray: object[] = [];
    for (let i = 0; i < amountOfBoulders; i++) {
      emptyBoulderArray.push({});
    }
    const initializeBouldersArray: boulderData[] = emptyBoulderArray.map(boulder => {
      const currentPointValue = pointValue; // Store the current value
      pointValue += 100; // Increment pointValue for the next boulder

      return {
        points: currentPointValue, // Use the stored value for this boulder
        color: "red",
        competitionId: compId,
        grade: "",
      };
    });
    setBoulders(initializeBouldersArray);
  };

  const handleColorChange = (index: number, newColor: string) => {
    const updatedBoulders = [...boulders];
    updatedBoulders[index] = { ...updatedBoulders[index], color: newColor };
    setBoulders(updatedBoulders);
  };

  const handleAddMultipleBoulders = async () => {
    const data = { boulderData: boulders };

    try {
      const response = await fetch("/api/mixer/manager/boulder/add-boulders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({ message: "could not add boulders", color: "red" });
      } else {
        showNotification({
          message: `Successfully added ${amountOfBoulders} boulders`,
          color: "green",
        });
      }
      router.refresh();
      onCancel();
    } catch (error) {
      showNotification({ message: "could not add boulders", color: "red" });
    }
  };

  const handleGradeChange = (index: number, newGrade: string) => {
    const updatedBoulders = [...boulders];
    updatedBoulders[index] = { ...updatedBoulders[index], grade: newGrade };
    setBoulders(updatedBoulders);
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
          <h2 className="text-xl">New Boulders</h2>

          {!isBoulderInformation ? (
            <div className="flex flex-col gap-3 items-center">
              {/* if the user picked all routes */}
              <p className="font-normal">How many boulders are you adding?</p>
              <div className="flex gap-5 items-center">
                <div className="flex gap-2 items-center">
                  <button
                    className="rounded-full bg-red-500 size-8 "
                    onClick={() => setAmountOfBoulders(0)}
                  >
                    0
                  </button>
                  <button
                    className="rounded-full bg-red-500 p-1 "
                    onClick={() => decrementAmountOfBoulders()}
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
                </div>
                <p className="text-3xl">{amountOfBoulders}</p>
                <div className="flex gap-2 items-center">
                  <button
                    className="rounded-full bg-green-500 p-1 "
                    onClick={() => incrementAmountOfBoulders()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-10 stroke-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                  <button
                    className="rounded-full bg-green-500 size-8 "
                    onClick={() => setAmountOfBoulders(30)}
                  >
                    30
                  </button>
                </div>
              </div>
              {isAmountSave && (
                <button
                  className="mt-8 text-2xl "
                  onClick={() => {
                    initializeBoulders();
                    setIsBoulderInformation(true);
                  }}
                >
                  Next {"→"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* if the user has picked many routes and inputted how many routes they wanted */}
              <p>boulder Information</p>
              <div className="h-72 overflow-hidden overflow-y-auto flex flex-col gap-2 p-2">
                {boulders.map((boulder, index) => (
                  <div className="flex flex-col gap-1" key={index}>
                    <div
                      className={clsx(
                        "p-2  rounded",
                        boulder.color === "red" && "bg-red-500/25 outline outline-red-500",
                        boulder.color === "blue" && "bg-blue-500/25 outline outline-blue-500",
                        boulder.color === "green" && "bg-green-400/25 outline outline-green-400",
                        boulder.color === "orange" && "bg-orange-500/25 outline outline-orange-500",
                        boulder.color === "yellow" && "bg-yellow-500/25 outline outline-yellow-500",
                        boulder.color === "pink" && "bg-pink-400/25 outline outline-pink-400",
                        boulder.color === "purple" && "bg-purple-600/25 outline outline-purple-600",
                        boulder.color === "white" && "bg-white/25 outline outline-white",
                        boulder.color === "black" && "bg-black/25 outline outline-white"
                      )}
                    >
                      <p>{boulder.points}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <label>Color:</label>
                          <select
                            name=""
                            id=""
                            className="bg-bg1 px-2 p-1 rounded"
                            value={boulder.color}
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
                        <div className="flex gap-2">
                          <label htmlFor="">Grade:</label>
                          <BoulderGradeSelect onGradeChange={e => handleGradeChange(index, e)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-0.5 rounded w-full bg-white" />

              <div className="justify-end w-full">
                <button
                  className="p-2 rounded bg-green-400"
                  onClick={() => handleAddMultipleBoulders()}
                >
                  Add Boulders
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
