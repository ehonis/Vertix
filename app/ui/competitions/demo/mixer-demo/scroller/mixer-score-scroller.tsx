"use client";

import { useState } from "react";
import MixerCountdownTimer from "./mixer-count-down-timer";
import TypeToggleSwitch from "./mixer-type-toggle";
import MixerRopeScorer from "./mixerRopeSwiper";
import MixerBoulderScorer from "./mixerBoulderSwiper";
import { MixerBoulder } from "@/generated/prisma/browser";
type RouteData = {
  name: string;
  id: string;
  imageUrl: string | null;
  color: string;
  holds: string;
  grade: string | null;
  competitionId: string;
};

type MixerScoreScoller = {
  mixerRoutes: RouteData[];
  mixerBoulders: MixerBoulder[];
};

export default function MixerScoreScroller({ mixerRoutes, mixerBoulders }: MixerScoreScoller) {
  const [category, setCategory] = useState("Rope");

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  return (
    <div className="w-screen">
      <div className="flex flex-col p-5 pt-3 pb-1">
        <div className="mb-1 flex justify-between max-w-md gap-5 md:max-w-lg place-self-center">
          <MixerCountdownTimer timeAllotted={undefined} />
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
        <MixerRopeScorer mixerRoutes={mixerRoutes} />
      </div>
      <div className={category === "Boulder" ? "block" : "hidden"}>
        <MixerBoulderScorer mixerBoulders={mixerBoulders} />
      </div>
    </div>
  );
}
