'use client';

import { useState, useEffect } from 'react';

export default function MixerCountdownTimer({ startTime, timeAllotted }) {
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // Initialize with 3 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0)); // Decrement time by 1 second
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="text-center font-bold text-black font-barlow  bg-white outline p-1 outline-black w-[4.5rem]  rounded">
      {formatTime(timeLeft)}
    </div>
  );
}
