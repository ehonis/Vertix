"use client";

import { useState, useEffect } from "react";

interface TimerAnimationProps {
  duration?: number; // Duration in seconds
  size?: number; // Size in pixels
  strokeWidth?: number; // Stroke width
  color?: string; // Color of the progress
  onComplete?: () => void; // Callback when timer completes
  className?: string; // Additional CSS classes
}

export default function TimerAnimation({
  duration = 5,
  size = 60,
  strokeWidth = 4,
  color = "#3b82f6",
  onComplete,
  className = "",
}: TimerAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate the circumference of the circle
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (isComplete) return;

    const startTime = Date.now();
    const totalDuration = duration * 1000; // Convert to milliseconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        setIsComplete(true);
        onComplete?.();
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [duration, isComplete, onComplete]);

  // Reset function to restart the timer
  const reset = () => {
    setProgress(0);
    setIsComplete(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90" // Rotate so it starts from top
      >
        {/* Background circle - transparent */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="transparent"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-75 ease-linear"
        />
      </svg>

      {/* Optional: Reset button (for testing) */}
      {isComplete && (
        <button
          onClick={reset}
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      )}
    </div>
  );
}
