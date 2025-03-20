"use client";

import { useState } from "react";
import MixerCountdownTimer from "./mixer-count-down-timer";
import TypeToggleSwitch from "./mixer-type-toggle";
import MixerRopeScorer from "./mixerRopeSwiper";
import MixerBoulderScorer from "./mixerBoulderSwiper";

export default function MixerScoreScroller({ mixerRoutes, mixerBoulders, StartTime }) {
  const [category, setCategory] = useState("Rope");

  const handleCategoryChange = value => {
    setCategory(value);
  };

  return (
    <div className="w-screen">
      <div className="flex flex-col p-5 pt-3 pb-1">
        <div className="mb-1 flex justify-between max-w-md gap-5 md:max-w-lg place-self-center">
          <MixerCountdownTimer />
          <TypeToggleSwitch
            leftLabel={"Boulder"}
            rightLabel={"Rope"}
            value={category}
            onTypeSwitchValue={handleCategoryChange}
          />
          <button className="text-sm flex items-center justify-center gap-1 text-white font-barlow font-semibold">
            <div className="bg-green-500 rounded px-2 py-2">
              <p>Submit</p>
            </div>
          </button>
        </div>
      </div>

      <div className={category === "Rope" ? "block" : "hidden"}>
        <MixerRopeScorer mixerRoutes={mixerRoutes} StartTime={StartTime} />
      </div>
      <div className={category === "Boulder" ? "block" : "hidden"}>
        <MixerBoulderScorer mixerBoulders={mixerBoulders} StartTime={StartTime} />
      </div>
    </div>
  );
}
