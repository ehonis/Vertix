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
        className="bg-green-500 text-white px-4 py-2 rounded-md"
        onClick={() => setIsNewRoutePopupOpen(true)}
      >
        <p className="font-barlow font-bold">Add Route</p>
      </button>
    </div>
  );
}
