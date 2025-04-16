"use client";

import { RouteAttempt, RouteCompletion, RouteType } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import InformationalPopUp from "../../general/informational-pop-up";

function getDate365DaysAgo(): Date {
  const today = new Date(); // Current date
  const msInDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
  const daysToSubtract = 365;
  const pastDate = new Date(today.getTime() - daysToSubtract * msInDay);
  return pastDate;
}

// Helper function to get color based on activity level
function getColorForActivity(count: number): string {
  if (count === 0) return "#314158"; // No activity (darkest blue)
  if (count === 1) return "#1e4976"; // Light blue - low activity
  if (count === 2) return "#0b51a3"; // Medium blue - medium activity
  if (count === 3) return "#0066cc"; // Brighter blue - high activity
  return "#0099ff"; // Brightest blue - very high activity (4+ completions)
}

// Helper function to get activity count for a specific date
function getActivityForDate(
  date: Date,
  completionData: (RouteCompletion & { route: { type: RouteType; grade: string } })[],
  attemptsData: (RouteAttempt & { route: { type: RouteType; grade: string } })[]
): number {
  const dateString = date.toISOString().split("T")[0];
  const completions = completionData.filter(completion => {
    const completionDate = new Date(completion.completionDate).toISOString().split("T")[0];
    return completionDate === dateString;
  }).length;
  const attempts = attemptsData.filter(attempt => {
    const attemptDate = new Date(attempt.attemptDate).toISOString().split("T")[0];
    return attemptDate === dateString;
  }).length;
  return completions + attempts;
}

export default function ActivityGraph({
  completionData,
  attemptsData,
}: {
  completionData: (RouteCompletion & { route: { type: RouteType; grade: string } })[];
  attemptsData: (RouteAttempt & { route: { type: RouteType; grade: string } })[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to right on initial render
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, []);
  const [showInfo, setShowInfo] = useState(false);

  const numDays = 365;
  const weeks = Math.ceil(numDays / 7);
  const startDate = getDate365DaysAgo();
  const today = new Date();

  const renderDay = (date: Date, index: number) => {
    const count = getActivityForDate(date, completionData, attemptsData);
    const color = getColorForActivity(count);
    const dateString = date.toISOString().slice(0, 10);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <rect
        key={index}
        width="11"
        height="11"
        x={Math.floor(index / 7) * 13}
        y={(index % 7) * 13}
        fill={color}
        data-date={dateString}
        data-count={count}
        className="rounded-xs hover:outline  hover:outline-white transition-all duration-200"
        data-tooltip={`${formattedDate}: ${count} ${count === 1 ? "completion" : "completions"}`}
      />
    );
  };

  const days = [];
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    if (currentDate <= today) {
      days.push(renderDay(currentDate, i));
    }
  }

  // Generate month labels
  const monthLabels = [];
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    const monthName = monthDate.toLocaleString("default", { month: "short" });
    monthLabels.push(
      <text
        key={i}
        x={i * (weeks / 12) * 13 + 10}
        y={-5}
        className="text-xs fill-gray-400 text-white"
      >
        {monthName}
      </text>
    );
  }

  // Generate day labels
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
    <text key={day} x={-15} y={i * 13 + 15} className="text-xs fill-gray-400">
      {day}
    </text>
  ));

  const infoHtml = (
    <div>
      <h3 className="font-barlow text-blue-500 text-lg font-bold">Activity</h3>
      <p className="text-white text-sm">
        This graph shows your activity over the last 365 days. The higher the activity for that day
        the brighter the color. Attempts and Completions count to the total.
      </p>
    </div>
  );
  return (
    <div>
      {showInfo && <InformationalPopUp html={infoHtml} onCancel={() => setShowInfo(false)} />}
      <div className="flex flex-row justify-start items-center gap-2 mb-2">
        <h3 className="font-barlow text-white text-2xl font-bold ">Activity</h3>
        <button onClick={() => setShowInfo(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            className="size-8 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </button>
      </div>
      <div className=" bg-slate-900 rounded-md p-2 px-5">
        <div ref={scrollContainerRef} className="overflow-x-auto bg-slate-900 rounded-md ">
          <div className="p-2">
            <svg width={weeks * 13 + 30} height="120">
              <g transform="translate(30, 20)">
                {monthLabels}
                {days}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
