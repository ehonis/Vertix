import { useEffect, useState } from 'react';

export default function Notification({ emotion, message, onQuit }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the notification when the component mounts
    setIsVisible(true);

    // Hide the notification after some time (e.g., 3 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onQuit(); // Call the onQuit function when it disappears
    }, 100000);

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
      className={`fixed top-16 left-0 transition-all w-full duration-500 ease-in-out transform ${
        isVisible ? 'h-8 opacity-100' : 'h-0 opacity-0 overflow-hidden'
      } flex ${color} p-1 items-center gap-2 justify-between z-50`}
    >
      <button onClick={onQuit} className="rounded-full bg-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      <p className="text-black font-bold ">{message}</p>
      <div></div>
    </div>
  );
}
