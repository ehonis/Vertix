'use client';

import { useState, useEffect } from 'react';

export default function TypeToggleSwitch({
  leftLabel,
  rightLabel,
  value,
  onTypeSwitchValue,
}) {
  const [isLeftLabel, setIsLeftLabel] = useState(value); // Default to the passed value

  useEffect(() => {
    setIsLeftLabel(value); // Sync state when the parent changes the value prop
  }, [value]);

  const toggleSwitch = () => {
    const newValue = isLeftLabel === leftLabel ? rightLabel : leftLabel; // Toggle between "TR" and "Lead"
    setIsLeftLabel(newValue);
    onTypeSwitchValue(newValue); // Notify the parent component
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Left Label */}
      <span
        className={`font-barlow font-bold ${
          isLeftLabel === leftLabel
            ? 'text-blue-500 underline'
            : 'text-gray-500'
        }`}
      >
        {leftLabel}
      </span>

      {/* Toggle Switch */}
      <div
        className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${
          isLeftLabel === leftLabel ? 'bg-blue-500' : 'bg-green-500'
        }`}
        onClick={toggleSwitch}
      >
        <div
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            isLeftLabel === leftLabel ? 'translate-x-0' : 'translate-x-8'
          }`}
        ></div>
      </div>

      {/* Right Label */}
      <span
        className={`font-barlow font-bold ${
          isLeftLabel === rightLabel
            ? 'text-green-500 underline'
            : 'text-gray-500'
        }`}
      >
        {rightLabel}
      </span>
    </div>
  );
}
