//generic countdown timer that shows the time left for the competition to end without any notifications or onfinish function

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function MixerCountdownTimer({
  timeAllotted,
  startedAt,
}: {
  timeAllotted: number | undefined | null;
  startedAt: Date | undefined | null;
}) {
  const router = useRouter();

  // Calculate initial time left when component mounts
  const calculateInitialTimeLeft = () => {
    if (!startedAt || !timeAllotted) return 1800;

    // Convert timeAllotted from minutes to seconds
    const timeAllottedInSeconds = timeAllotted * 60;

    // Get current time in milliseconds
    const currentTime = new Date().getTime();
    // Get start time in milliseconds
    const startTime = startedAt.getTime();
    // Calculate elapsed time in seconds
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    // Calculate remaining time, ensuring it doesn't go below 0
    const remainingTime = Math.max(0, timeAllottedInSeconds - elapsedTime);

    return remainingTime;
  };

  // Initialize state with calculated time left
  const [timeLeft, setTimeLeft] = useState(calculateInitialTimeLeft());

  // Function to check and show notifications at specific time intervals

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        // Decrement time by 1 second, but don't go below 0
        const newTime = Math.max(0, prevTime - 1);
        // Check for notifications and finish callback

        return newTime;
      });
    }, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(timer);
  }, []);

  // Format time in HH:MM:SS format
  const formatTime = (seconds: number) => {
    // Calculate hours, minutes, and remaining seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Format each unit with leading zeros
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };
  // Refresh router every 5 minutes to ensure time synchronization
  useEffect(() => {
    // Set interval to refresh router every 5 minutes (300000 milliseconds)
    const routerRefreshInterval = setInterval(() => {
      // Force router refresh to get updated time from server
      router.refresh();
    }, 300000);

    // Cleanup interval when component unmounts
    return () => clearInterval(routerRefreshInterval);
  }, [router]); // Add router as dependency
  return (
    <div className="text-center font-bold text-black font-barlow bg-white outline p-1 rounded flex justify-center items-center">
      {formatTime(timeLeft)}
    </div>
  );
}
