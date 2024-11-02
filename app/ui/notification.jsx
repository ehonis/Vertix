'use client';

import { useEffect, useState } from 'react';

export default function Notification({ emotion, message, onQuit }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the notification when the component mounts
    setIsVisible(true);

    // Hide the notification after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onQuit(); // Call the onQuit function when it disappears
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [onQuit]);

  let color = 'bg-gray-400';
  if (emotion === 'happy') {
    color = 'bg-green-400';
  } else if (emotion === 'bad') {
    color = 'bg-red-400';
  }

  return (
    <div
      className={`fixed bottom-4 left-4 transition-all duration-500 ease-in-out transform ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${color} p-3 rounded-lg shadow-lg flex items-center gap-2 z-50 w-72`}
    >
      <button onClick={onQuit} className="rounded-full bg-red-600 p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      <p className="text-black font-bold truncate">{message}</p>
    </div>
  );
}
