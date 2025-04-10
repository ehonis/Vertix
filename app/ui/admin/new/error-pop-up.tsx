"use client";
import { useEffect, useState } from "react";

export default function ErrorPopUp({
  onCancel,
  message,
}: {
  onCancel: () => void;
  message: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set isVisible to true after the component mounts to trigger the transition
    setIsVisible(true);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-30 transition-opacity duration-700 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
      />
      {/* Popup */}
      <div
        className={`fixed z-100 bg-[#181a1c] text-white top-1/2 left-1/2 transform rounded-lg w-2/3 -translate-x-1/2 ${
          isVisible ? "-translate-y-1/2 opacity-100" : "translate-y-full opacity-0"
        } transition-all duration-700 ease-out p-5 rounded shadow-lg`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          className="size-6 stroke-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>

        <p className="font-bold">{message}</p>
        <div className="flex justify-end">
          <button onClick={onCancel} className="mt-4 rounded-full bg-red-500 px-3 py-1 text-white">
            Exit
          </button>
        </div>
      </div>
    </>
  );
}
