"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { Virtual } from "swiper/modules";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import "swiper/css";
import { useNotification } from "@/app/contexts/NotificationContext";
import { MixerBoulder, MixerCompletion } from "@prisma/client";

type MixeBoulderScrollerData = {
  compId: string;
  climberId: string;
  mixerBoulders: MixerBoulder[];
  boulderCompletions: MixerCompletion[];
};

export default function MixerBoulderScorer({
  compId,
  climberId,
  mixerBoulders,
  boulderCompletions,
}: MixeBoulderScrollerData) {
  const { showNotification } = useNotification();

  type BoulderState = {
    [key: string]: number;
  };

  type CompletionState = {
    [key: string]: boolean;
  };

  // Load initial state from localStorage or use default values
  const [boulderAttempts, setBoulderAttempts] = useState<BoulderState>(() => {
    return mixerBoulders.reduce((acc: BoulderState, panel) => {
      acc[panel.id] = 0;
      return acc;
    }, {});
  });

  const [completions, setCompletions] = useState<CompletionState>(() => {
    // Initialize completions from database completions, with fallback for undefined
    return mixerBoulders.reduce((acc: CompletionState, panel) => {
      // Check if this boulder is in the database completions
      // If boulderCompletions is undefined or empty, default to false
      const isCompleted =
        boulderCompletions?.some(completion => completion.mixerBoulderId === panel.id) ?? false;
      if (isCompleted) {
        // If boulder is completed, get the attempts from boulderCompletions
        const completion = boulderCompletions.find(c => c.mixerBoulderId === panel.id);
        // Update attempts state with the stored value
        boulderAttempts[panel.id] = completion?.attempts || 0;
      }
      acc[panel.id] = isCompleted;
      return acc;
    }, {});
  });

  const [boulderRangeValue, setBoulderRangeValue] = useState<number>(0);
  const swiperBoulderRef = useRef<SwiperType | null>(null);

  const handleBoulderAttemptChange = (panelId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9]/g, "");
    setBoulderAttempts(prev => ({
      ...prev,
      [panelId]: Math.min(Number(sanitizedValue), 20),
    }));
  };

  const handlePlusBoulderAttempt = (panelId: string) => {
    setBoulderAttempts(prev => ({
      ...prev,
      [panelId]: Math.min(prev[panelId] + 1, 20),
    }));
  };

  const handleMinusBoulderAttempt = (panelId: string) => {
    setBoulderAttempts(prev => ({
      ...prev,
      [panelId]: Math.max(prev[panelId] - 1, 0),
    }));
  };

  const handleBoulderRangeChange = (value: number) => {
    // Ensure value is a valid number
    const newValue = typeof value === "number" ? value : 0;
    setBoulderRangeValue(newValue);
    if (swiperBoulderRef.current) {
      swiperBoulderRef.current.slideTo(newValue);
    }
  };

  const handleBoulderCompletion = async (panelId: string, attempts: number, points: number) => {
    if (attempts < 1) {
      showNotification({
        message: `1 Attempt Needed`,
        color: "red",
      });
    } else {
      try {
        // Update local state
        setCompletions(prev => ({
          ...prev,
          [panelId]: true,
        }));

        // Update database

        const response = await fetch("/api/mixer/comp/boulder-completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mixerBoulderId: panelId,
            climberId: climberId,
            compId: compId,
            attempts: attempts,
            points: points,
            type: "BOULDER",
          }),
        });

        if (!response.ok) {
          showNotification({
            message: `Oops! Failed to save completion, uncompleting... please try again`,
            color: "red",
          });
        }

        showNotification({
          message: `Boulder ${points} completion saved successfully!`,
          color: "green",
        });
      } catch (error) {
        showNotification({
          message: `Oops! Failed to save completion, uncompleting... please try again`,
          color: "red",
        });
        // Revert local state on error
        setCompletions(prev => ({
          ...prev,
          [panelId]: false,
        }));
      }
    }
  };

  const handleBoulderUncompletion = async (panelId: string) => {
    try {
      // Update local state
      setCompletions(prev => ({
        ...prev,
        [panelId]: false,
      }));

      // Delete from database
      const response = await fetch(
        `/api/mixer/comp/boulder-completions?mixerBoulderId=${panelId}&climberId=${climberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete completion");
      }

      showNotification({
        message: "Uncompleted saved successfully!",
        color: "green",
      });
    } catch (error) {
      showNotification({
        message: "Failed to uncomplete boulder",
        color: "red",
      });
      // Revert local state on error
      setCompletions(prev => ({
        ...prev,
        [panelId]: true,
      }));
    }
  };

  return (
    <>
      <Swiper
        direction="vertical"
        grabCursor={true}
        onSwiper={swiper => (swiperBoulderRef.current = swiper)}
        onSlideChange={swiper => setBoulderRangeValue(swiper.activeIndex ?? 0)}
        className="h-[calc(100vh-16rem)] max-w-sm md:max-w-lg rounded-sm"
        modules={[Virtual]}
        virtual
        allowTouchMove={true}
        resistance={true}
        resistanceRatio={0.85}
      >
        {mixerBoulders.map((panel, index) => (
          <SwiperSlide key={panel.id} virtualIndex={index} className="p-8 pt-2 rounded-lg">
            {completions[panel.id] === false ? (
              <div
                className={clsx(
                  "relative flex flex-col p-5 pt-6 items-center h-full rounded-lg bg-black shadow-lg text-white text-2xl gap-3 justify-between",
                  panel.color === "blue" ? "shadow-blue-500" : null,
                  panel.color === "red" ? "shadow-red-500" : null,
                  panel.color === "green" ? "shadow-green-400" : null,
                  panel.color === "orange" ? "shadow-orange-500" : null,
                  panel.color === "yellow" ? "shadow-yellow-400" : null,
                  panel.color === "pink" ? "shadow-pink-400" : null,
                  panel.color === "brown" && "shadow-amber-800",
                  panel.color === "purple" && "shadow-purple-700",
                  panel.color === "white" && "shadow-white",
                  panel.color === "black" && "shadow-2xl"
                )}
              >
                <div className="flex flex-col gap-2">
                  {/* header */}
                  <div className="flex flex-col gap-2">
                    <h1
                      className={clsx(
                        "font-tomorrow font-bold text-6xl text-center",
                        panel.color === "blue" ? "text-blue-500" : null,
                        panel.color === "green" ? "text-green-400" : null,
                        panel.color === "orange" ? "text-orange-500" : null,
                        panel.color === "yellow" ? "text-yellow-300" : null,
                        panel.color === "red" ? "text-red-500" : null,
                        panel.color === "pink" ? "text-pink-400" : null,
                        panel.color === "brown" && "text-amber-800",
                        panel.color === "purple" && "text-purple-700",
                        panel.color === "white" && "text-white",
                        panel.color === "black" && "text-white"
                      )}
                    >
                      {panel.points}
                    </h1>
                  </div>
                </div>

                {/* attempts */}
                <div className="flex flex-col items-center">
                  <label htmlFor="" className="font-barlow font-bold text-xl text-white">
                    Attempts
                  </label>
                  <div className="flex items-center gap-3 blue-button p-2 rounded-md">
                    <button
                      className="rounded-full size-12 font-barlow font-bold bg-red-500/45 border-2 border-red-500 flex justify-center items-center"
                      onClick={() => handleMinusBoulderAttempt(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={5}
                        stroke="currentColor"
                        className="size-4"
                        style={{
                          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={boulderAttempts[panel.id]}
                      onChange={e => handleBoulderAttemptChange(panel.id, e)}
                      className="p-2 text-white font-barlow font-bold size-10 text-2xl rounded-sm text-center focus:outline-hidden border-none"
                      placeholder="#"
                    />
                    <button
                      className="rounded-full size-12 font-barlow font-bold bg-green-500/45 border-2 border-green-500 flex justify-center items-center"
                      onClick={() => handlePlusBoulderAttempt(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={5}
                        stroke="currentColor"
                        className="size-4"
                        style={{
                          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* completion */}
                <div className="flex flex-col gap-3 items-center">
                  <button
                    className="bg-green-500/45 border-2 border-green-500 rounded-full size-16 flex justify-center items-center"
                    onClick={() =>
                      handleBoulderCompletion(panel.id, boulderAttempts[panel.id], panel.points)
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="size-10 stroke-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* complete panel */}
                <div
                  className={clsx(
                    "flex flex-col justify-between p-3 bg-green-500/20 border-2 border-green-500 h-full w-full text-white text-2xl shadow-lg rounded-lg z-20",
                    panel.color === "blue" ? "shadow-blue-500" : null,
                    panel.color === "red" ? "shadow-red-500" : null,
                    panel.color === "green" ? "shadow-green-400" : null,
                    panel.color === "orange" ? "shadow-orange-500" : null,
                    panel.color === "yellow" ? "shadow-yellow-400" : null,
                    panel.color === "pink" ? "shadow-pink-400" : null,
                    panel.color === "brown" && "shadow-amber-800",
                    panel.color === "purple" && "shadow-purple-700",
                    panel.color === "white" && "shadow-white",
                    panel.color === "black" && "shadow-black"
                  )}
                >
                  <div className="z-30">
                    <h1
                      className={clsx(
                        "font-tomorrow font-bold text-6xl text-center mb-2 drop-shadow-customBlack",
                        panel.color === "blue" ? "text-blue-500" : null,
                        panel.color === "green" ? "text-green-400" : null,
                        panel.color === "orange" ? "text-orange-500" : null,
                        panel.color === "yellow" ? "text-yellow-300" : null,
                        panel.color === "red" ? "text-red-500" : null,
                        panel.color === "pink" ? "text-pink-400" : null,
                        panel.color === "brown" && "text-amber-800",
                        panel.color === "purple" && "text-purple-700",
                        panel.color === "white" && "text-white",
                        panel.color === "black" && "text-black "
                      )}
                    >
                      {panel.points}
                    </h1>
                    <p className="font-tomorrow font-bold gradient-text-green-lime text-center">
                      Completed
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    {boulderAttempts[panel.id] !== 1 ? (
                      <p className="font-barlow font-bold text-white text-2xl text-center drop-shadow-customBlack">
                        {boulderAttempts[panel.id]} attempts
                      </p>
                    ) : (
                      <p className="font-barlow font-bold text-white text-4xl text-center drop-shadow-customBlack">
                        Flash!
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-barlow font-bold text-white text-center drop-shadow-customBlack">
                      Uncomplete?
                    </h2>
                    <button
                      className="rounded-full size-14 font-barlow font-bold bg-red-500 flex justify-center items-center shadow-lg drop-shadow-customBlack"
                      onClick={() => handleBoulderUncompletion(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex flex-col w-full items-center">
        <input
          type="range"
          min="0"
          max={mixerBoulders.length - 1}
          step="1"
          value={boulderRangeValue}
          onChange={e => handleBoulderRangeChange(Number(e.target.value))}
          className=" slider w-3/4 md:w-1/5 mb-2 appearance-none bg-gray-300 rounded-sm h-2 mt-4"
        />

        {/* Slider Labels */}
        <div className="flex justify-between w-3/4 md:w-1/5 text-sm text-gray-400">
          <span className="text-left font-barlow font-bold">{mixerBoulders[0].points}</span>
          <span className="text-center font-barlow font-bold">
            {mixerBoulders[Math.floor(mixerBoulders.length / 2)].points}
          </span>
          <span className="text-right font-barlow font-bold">
            {mixerBoulders[mixerBoulders.length - 1].points}
          </span>
        </div>
      </div>
    </>
  );
}
