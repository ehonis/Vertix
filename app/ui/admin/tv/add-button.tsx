"use client";

import NewSlidePopup from "./new-slide-popup";
import { useState } from "react";

export default function AddButton() {
  const [isNewSlidePopupOpen, setIsNewSlidePopupOpen] = useState(false);
  return (
    <>
      <button
        className="green-button text-white font-bold p-2 rounded-md"
        onClick={() => setIsNewSlidePopupOpen(true)}
      >
        Add
      </button>
      {isNewSlidePopupOpen && <NewSlidePopup onCancel={() => setIsNewSlidePopupOpen(false)} />}
    </>
  );
}
