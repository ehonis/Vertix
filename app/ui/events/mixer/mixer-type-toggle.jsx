'use client';

import { useState, useEffect } from 'react';

export default function TypeToggleSwitch({ value, onTypeSwitchValue }) {
  const [isTopRope, setIsTopRope] = useState(value); // Default to the passed value

  useEffect(() => {
    setIsTopRope(value); // Sync state when the parent changes the value prop
  }, [value]);

  const toggleSwitch = () => {
    const newValue = isTopRope === 'TR' ? 'Lead' : 'TR'; // Toggle between "TR" and "Lead"
    setIsTopRope(newValue);
    onTypeSwitchValue(newValue); // Notify the parent component
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* TR Label */}
      <span
        className={`font-barlow ${
          isTopRope === 'TR' ? 'text-blue-500 underline' : 'text-gray-500'
        }`}
      >
        TR
      </span>

      {/* Toggle Switch */}
      <div
        className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${
          isTopRope === 'TR' ? 'bg-blue-500' : 'bg-green-500'
        }`}
        onClick={toggleSwitch}
      >
        <div
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            isTopRope === 'TR' ? 'translate-x-0' : 'translate-x-8'
          }`}
        ></div>
      </div>

      {/* Lead Label */}
      <span
        className={`font-barlow ${
          isTopRope === 'Lead' ? 'text-green-500 underline' : 'text-gray-500'
        }`}
      >
        Lead
      </span>
    </div>
  );
}
