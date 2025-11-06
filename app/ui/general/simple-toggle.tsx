"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
export default function SimpleToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const toggle = () => {
    onValueChange(!value);
  };
  return (
    <div
      className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${
        value ? "bg-green-500" : "bg-gray-600"
      }`}
      onClick={toggle}
      tabIndex={0} // Allows keyboard focus
      role="switch"
      aria-checked={value} // Screen reader support
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onValueChange(!value);
      }}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
          value ? "translate-x-8" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
