"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import clsx from "clsx";
import { useState, useRef } from "react";
import "swiper/css";
import CountdownTimer from "./count-down-timer";
import { useNotification } from "@/app/contexts/NotificationContext";

const panels = [
  { id: 1, content: "100", color: "blue" },
  { id: 2, content: "200", color: "blue" },
  { id: 3, content: "300", color: "blue" },
  { id: 4, content: "400", color: "blue" },
  { id: 5, content: "500", color: "blue" },
  { id: 6, content: "600", color: "blue" },
  { id: 7, content: "700", color: "blue" },
  { id: 8, content: "800", color: "blue" },
  { id: 9, content: "900", color: "blue" },
  { id: 10, content: "1000", color: "yellow" },
  { id: 11, content: "1100", color: "yellow" },
  { id: 12, content: "1200", color: "yellow" },
  { id: 13, content: "1300", color: "yellow" },
  { id: 14, content: "1400", color: "yellow" },
  { id: 15, content: "1500", color: "yellow" },
  { id: 16, content: "1600", color: "orange" },
  { id: 17, content: "1700", color: "orange" },
  { id: 18, content: "1800", color: "orange" },
  { id: 19, content: "1900", color: "orange" },
  { id: 20, content: "2000", color: "orange" },
  { id: 21, content: "2100", color: "red" },
  { id: 22, content: "2200", color: "red" },
  { id: 23, content: "2300", color: "red" },
  { id: 24, content: "2400", color: "red" },
  { id: 25, content: "2500", color: "red" },
];

export default function CompetitionScoreTraker() {
  const { showNotification } = useNotification();

  const [attempts, setAttempts] = useState(() =>
    panels.reduce((acc, panel) => {
      acc[panel.id] = 0; // Default value for each panel
      return acc;
    }, {})
  );
  const [completions, setCompletions] = useState(() =>
    panels.reduce((acc, panel) => {
      acc[panel.id] = false;
      return acc;
    }, {})
  );
  const [rangeValue, setRangeValue] = useState(0); // Range slider value
  const swiperRef = useRef(null); // Ref to control Swiper instance

  const handleChange = (panelId, e) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9]/g, "");
    setAttempts(prev => ({
      ...prev,
      [panelId]: Math.min(Number(sanitizedValue), 20),
    }));
  };

  const handlePlusAttempt = panelId => {
    setAttempts(prev => ({
      ...prev,
      [panelId]: Math.min(prev[panelId] + 1, 20),
    }));
  };

  const handleMinusAttempt = panelId => {
    setAttempts(prev => ({
      ...prev,
      [panelId]: Math.max(prev[panelId] - 1, 0),
    }));
  };

  const handleRangeChange = value => {
    setRangeValue(value);
    if (swiperRef.current) {
      swiperRef.current.slideTo(value);
    }
  };

  const handleCompletion = (panelId, attempts) => {
    if (attempts < 1) {
      showNotification({
        message: `1 Attempt Needed`,
        color: "red",
      });
    } else {
      setCompletions(prev => ({
        ...prev,
        [panelId]: true,
      }));
    }
  };
  const handleUncompletion = panelId => {
    setCompletions(prev => ({
      ...prev,
      [panelId]: false,
    }));
  };

  return (
    <div>
      <CountdownTimer />
      <div className="flex flex-col items-center justify-center mb-1">
        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max={panels.length - 1}
          step="1"
          value={rangeValue}
          onChange={e => handleRangeChange(Number(e.target.value))}
          className="w-3/4 mb-2 appearance-none bg-gray-300 rounded-sm h-2"
        />

        {/* Slider Labels */}
        <div className="flex justify-between w-3/4 text-sm text-gray-400">
          <span className="text-left font-barlow font-bold">{panels[0].content}</span> {/* Start */}
          <span className="text-center font-barlow font-bold">
            {panels[Math.floor(panels.length / 2)].content}
          </span>{" "}
          {/* Middle */}
          <span className="text-right font-barlow font-bold">
            {panels[panels.length - 1].content}
          </span>{" "}
          {/* End */}
        </div>
      </div>
      {/* Panel Swiper*/}
      <Swiper
        direction="vertical"
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={swiper => (swiperRef.current = swiper)} // Get Swiper instance
        onSlideChange={swiper => setRangeValue(swiper.activeIndex)} // Sync slider with Swiper
        className="h-svh rounded-sm"
      >
        {panels.map(panel => (
          <SwiperSlide key={panel.id} className="p-8 pt-6 rounded-lg">
            {completions[panel.id] === false ? (
              <div
                className={clsx(
                  "flex flex-col p-5 pt-8 items-center h-full rounded-lg bg-black shadow-blue-500 shadow-xl text-white text-2xl gap-5 justify-between",
                  panel.color === "blue" ? "shadow-blue-500" : null,
                  panel.color === "red" ? "shadow-red-500" : null,
                  panel.color === "orange" ? "shadow-orange-500" : null,
                  panel.color === "yellow" ? "shadow-yellow-400" : null
                )}
              >
                <div>
                  {/* header */}
                  <h1
                    className={clsx(
                      "font-stalinist text-6xl text-center mb-5",
                      panel.color === "blue" ? "text-blue-500" : null,
                      panel.color === "orange" ? "text-orange-500" : null,
                      panel.color === "yellow" ? "text-yellow-300" : null,
                      panel.color === "red" ? "text-red-500" : null
                    )}
                  >
                    {panel.content}
                  </h1>
                  {/* attempts */}
                  <div className="flex flex-col items-center gap-3">
                    <label htmlFor="" className="font-barlow font-bold text-3xl text-white">
                      Attempts
                    </label>
                    <div className="flex items-center gap-6">
                      <button
                        className="rounded-full size-14 font-barlow font-bold bg-red-500 flex justify-center items-center"
                        onClick={() => handleMinusAttempt(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-6"
                          style={{
                            filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))",
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={attempts[panel.id]}
                        onChange={e => handleChange(panel.id, e)}
                        className="border p-2 text-black font-barlow font-bold w-14 h-14 text-3xl rounded-sm text-center focus:outline-hidden"
                        placeholder="#"
                      />
                      <button
                        className="rounded-full size-14 font-barlow font-bold bg-green-500  flex justify-center items-center"
                        onClick={() => handlePlusAttempt(panel.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={5}
                          stroke="currentColor"
                          className="size-6"
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
                </div>
                {/* completion */}
                <div className="flex flex-col gap-3 items-center">
                  <button
                    className="bg-green-500 rounded-full size-16 flex justify-center items-center"
                    onClick={() => handleCompletion(panel.id, attempts[panel.id])}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-14"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
                    "flex flex-col p-5 pt-8 items-center h-full rounded-lg bg-green-400 shadow-xl text-white text-2xl gap-5 justify-between ",
                    panel.color === "blue" ? "shadow-blue-500" : null,
                    panel.color === "red" ? "shadow-red-500" : null,
                    panel.color === "orange" ? "shadow-orange-500" : null,
                    panel.color === "yellow" ? "shadow-yellow-400" : null
                  )}
                >
                  <h1
                    className={clsx(
                      "font-stalinist text-6xl text-center mb-5 drop-shadow-customBlack",
                      panel.color === "blue" ? "text-blue-500" : null,
                      panel.color === "orange" ? "text-orange-500" : null,
                      panel.color === "yellow" ? "text-yellow-300" : null,
                      panel.color === "red" ? "text-red-500" : null
                    )}
                  >
                    {panel.content}
                  </h1>
                  <div className="flex flex-col gap-5">
                    {attempts[panel.id] !== 1 ? (
                      <p className="font-barlow font-bold text-white text-4xl text-center drop-shadow-customBlack">
                        {attempts[panel.id]} attempts
                      </p>
                    ) : (
                      <p className="font-barlow font-bold text-white text-4xl text-center drop-shadow-customBlack">
                        Flash!
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-3xl font-barlow font-bold text-white text-center drop-shadow-customBlack">
                      Uncomplete?
                    </h2>
                    <button
                      className="rounded-full size-14 font-barlow font-bold bg-red-500 flex justify-center items-center shadow-lg drop-shadow-customBlack"
                      onClick={() => handleUncompletion(panel.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-10 "
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
    </div>
  );
}
