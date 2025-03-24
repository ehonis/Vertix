"use client";
import { useEffect, useState } from "react";
type ConfirmationPopUpProps = {
  onConfirmation: () => void;
  onCancel: () => void;
  message: string;
  submessage: string;
};
export default function ConfirmationPopUp({
  onConfirmation,
  onCancel,
  message,
  submessage,
}: ConfirmationPopUpProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set isVisible to true after the component mounts to trigger the transition
    setIsVisible(true);
  }, []);
  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-30 transition-opacity duration-700 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
      />
      <div
        className={`z-100 bg-[#181a1c] text-white w-72 fixed top-1/2 left-[45.25%] transform -translate-x-1/2 ${
          isVisible ? "-translate-y-1/2 opacity-100" : "translate-y-full opacity-0"
        } transition-all duration-700 ease-out m-5 p-5 rounded shadow-lg`}
      >
        <p className="font-bold text-xl text-center mb-3">{message}</p>
        <p className="text-red-500 text-sm text-center">{submessage}</p>
        <div className="flex justify-between">
          <button onClick={onConfirmation} className="mt-4 rounded-lg blue-button p-2 text-white">
            Confirm
          </button>
          <button onClick={onCancel} className="mt-4 rounded-lg red-button p-2 text-white">
            {" "}
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
