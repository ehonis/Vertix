"use client";

import { useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
export default function Toggle({ slideId, isActive }: { slideId: string; isActive: boolean }) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [isActiveState, setIsActiveState] = useState(isActive);

  const toggleSwitch = async () => {
    const newIsActive = !isActiveState;
    setIsActiveState(newIsActive);
    try {
      const response = await fetch(`/api/tv/updateSlide`, {
        method: "PUT",
        body: JSON.stringify({ slideId, isActive: newIsActive }),
      });
      if (!response.ok) {
        throw new Error("Error updating slide");
      }
      showNotification({
        message: `Successfully ${isActive ? "Disabled" : "Enabled"} slide`,
        color: "green",
      });
      router.refresh();
    } catch (error) {
      showNotification({
        message: `Error updating slide`,
        color: "red",
      });
    }
  };

  return (
    <div
      className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors ${
        isActiveState ? "bg-green-500" : "bg-gray-600"
      }`}
      onClick={toggleSwitch}
      tabIndex={0} // Allows keyboard focus
      role="switch"
      aria-checked={isActiveState} // Screen reader support
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") toggleSwitch();
      }}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
          isActiveState ? "translate-x-8" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
}
