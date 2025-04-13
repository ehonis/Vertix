"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";

export default function MixerCountdownTimer({
  timeAllotted,
  startedAt,
  onFinish,
}: {
  timeAllotted: number | undefined | null;
  startedAt: Date | undefined | null;
  onFinish: () => void;
}) {
  const { showNotification } = useNotification();
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
  const checkAndShowNotifications = (time: number) => {
    // Convert time to minutes for easier comparison
    const minutesLeft = Math.floor(time / 60);

    // Show notifications at specific intervals
    if (minutesLeft === 60) {
      showNotification({ message: "1 hour remaining!", color: "green" });
    } else if (minutesLeft === 30) {
      showNotification({ message: "30 minutes remaining!", color: "green" });
    } else if (minutesLeft === 10) {
      showNotification({ message: "10 minutes remaining!", color: "green" });
    } else if (minutesLeft === 1) {
      showNotification({ message: "1 minute remaining!", color: "red" });
    }

    // Call onFinish when timer reaches zero
    if (time === 0) {
      onFinish();
    }
  };

  useEffect(() => {
    // Check initial time for notifications
    checkAndShowNotifications(timeLeft);

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        // Decrement time by 1 second, but don't go below 0
        const newTime = Math.max(0, prevTime - 1);
        // Check for notifications and finish callback
        checkAndShowNotifications(newTime);
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

  return (
    <div className="text-center font-bold text-black font-barlow bg-white outline p-1 rounded flex justify-center items-center">
      {formatTime(timeLeft)}
    </div>
  );
}
