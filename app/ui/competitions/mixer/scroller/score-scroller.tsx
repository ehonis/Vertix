"use client";

import { useState } from "react";
import MixerCountdownTimer from "./count-down-timer";
import TypeToggleSwitch from "./type-toggle";
import MixerRopeScorer from "./rope-swiper";
import MixerBoulderScorer from "./boulder-swiper";
import { MixerBoulder, MixerClimber, MixerCompletion } from "@prisma/client";
import { User } from "@prisma/client";
type routeHold = {
  holdNumber: number;
  topRopePoints: number;
  leadPoints: number;
};
type RouteData = {
  name: string;
  id: string;
  color: string;
  holds: routeHold[];
  competitionId: string;
};
type MixerScoreScoller = {
  compId: string;
  mixerRoutes: RouteData[];
  mixerBoulders: MixerBoulder[];
  climber: MixerClimber;
  boulderCompletions: MixerCompletion[];
  ropeCompletions: MixerCompletion[];
};

export default function MixerScoreScroller({
  compId,
  mixerRoutes,
  mixerBoulders,
  climber,
  boulderCompletions,
  ropeCompletions,
}: MixerScoreScoller) {
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
              <p>Finish</p>
            </div>
          </button>
        </div>
      </div>

      <div className={category === "Rope" ? "block" : "hidden"}>
        <MixerRopeScorer
          mixerRoutes={mixerRoutes}
          ropeCompletions={ropeCompletions}
          compId={compId}
          climberId={climber.id}
        />
      </div>
      <div className={category === "Boulder" ? "block" : "hidden"}>
        <MixerBoulderScorer
          compId={compId}
          climberId={climber.id}
          mixerBoulders={mixerBoulders}
          boulderCompletions={boulderCompletions}
        />
      </div>
    </div>
  );
}
