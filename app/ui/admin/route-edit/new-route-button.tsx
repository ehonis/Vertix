"use client";

import { useState } from "react";
import NewRoutePopup from "./new-route-popup";
import { RouteTag } from "@prisma/client";

export default function NewRouteButton({ tags }: { tags: RouteTag[] }) {
  const [isNewRoutePopupOpen, setIsNewRoutePopupOpen] = useState(false);

  return (
    <div>
      {isNewRoutePopupOpen && (
        <NewRoutePopup onCancel={() => setIsNewRoutePopupOpen(false)} tags={tags} />
      )}
      <button
        className="bg-green-500 text-white px-2 py-2 rounded-md flex items-center gap-1"
        onClick={() => setIsNewRoutePopupOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 stroke-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <p className="font-barlow font-bold">Add Route </p>
      </button>
    </div>
  );
}
