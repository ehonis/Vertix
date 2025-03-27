"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";

type NewRoutePopUpProps = {
  onCancel: () => void;
};
export default function NewRoutePopUp({ onCancel }: NewRoutePopUpProps) {
  const [isChoiceMade, setIsChoiceMade] = useState<boolean>(false);
  const [amountOfRoutes, setAmountOfroutes] = useState<number>(0);
  const [isAllRoutes, setIsAllRoutes] = useState<boolean>(false);
  const [isAmountSave, setIsAmountSave] = useState(false);

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
          {!isChoiceMade ? (
            <div className="flex flex-col gap-3">
              <button
                className="flex gap-5 bg-gray-700 p-3 rounded-md items-center"
                onClick={() => {
                  setIsChoiceMade(true);
                  setIsAllRoutes(true);
                }}
              >
                <div className="bg-green-400 p-1 rounded-full max-w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-10 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-normal">Add All Routes</p>
              </button>
              <button
                className="flex gap-5 bg-gray-700 p-3 rounded-md items-center"
                onClick={() => setIsChoiceMade(true)}
              >
                <div className="bg-green-400 p-1 rounded-full max-w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-10 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-normal">Add One Route</p>
              </button>
            </div>
          ) : isAllRoutes ? (
            <div className="flex flex-col gap-3 items-center">
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
              {isAmountSave && <button className="mt-8 text-2xl ">Next {"→"}</button>}
            </div>
          ) : (
            <div></div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
