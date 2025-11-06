"use client";

import { useState, useEffect } from "react";

export default function OnOffSwitch({
  value,
  onTypeSwitchValue,
}: {
  value: boolean;
  onTypeSwitchValue: (value: boolean) => void;
}) {
  const [isOn, setIsOn] = useState(value ?? false); // Default to false if undefined

  useEffect(() => {
    setIsOn(value ?? false);
  }, [value]);

  const toggleSwitch = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    if (onTypeSwitchValue) {
      onTypeSwitchValue(newValue); // Ensure function exists before calling
    }
  };

  return (
    <div
      className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${
        isOn ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={toggleSwitch}
      tabIndex={0} // Allows keyboard focus
      role="switch"
      aria-checked={isOn} // Screen reader support
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") toggleSwitch();
      }}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
          isOn ? "translate-x-8" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
