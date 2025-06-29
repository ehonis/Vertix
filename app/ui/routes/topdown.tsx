"use client";

import { useState, useEffect } from "react";
import MobileTopdownParts from "./mobile-topdown-parts";
import { Locations } from "@prisma/client";

/**
 * TopDown component - Interactive wall selection interface
 *
 * This component renders an interactive SVG map of the climbing gym walls
 * and allows users to select different wall sections. It supports external
 * control of the initial selection through the initialSelection prop.
 *
 * @param onData - Callback function called when wall selection changes
 * @param initialSelection - Optional initial wall to be selected (for URL/localStorage persistence)
 */
export default function TopDown({
  onData,
  initialSelection = null,
}: {
  onData: (data: Locations | null) => void;
  initialSelection?: Locations | null;
}) {
  return (
    <>
      <svg
        viewBox="0 0 196.16191 133.63594"
        version="1.1"
        id="svg1"
        xmlns="http://www.w3.org/2000/svg"
        className="w-72 h-60"
      >
        <defs id="defs1" />
        <g id="layer2" transform="translate(-9.3866979,-163.67377)">
          <MobileTopdownParts onData={onData} initialSelection={initialSelection} />
        </g>
      </svg>
    </>
  );
}
