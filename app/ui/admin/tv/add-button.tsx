"use client";

import NewSlidePopup from "./new-slide-popup";
import { useState } from "react";

export default function AddButton() {
  const [isNewSlidePopupOpen, setIsNewSlidePopupOpen] = useState(false);
  return (
    <>
      <button
        className="green-button text-white text-xl font-bold p-2 rounded-md flex items-center gap-2"
        onClick={() => setIsNewSlidePopupOpen(true)}
      >
        Add
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 stroke-white stroke-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      {isNewSlidePopupOpen && <NewSlidePopup onCancel={() => setIsNewSlidePopupOpen(false)} />}
    </>
  );
}
