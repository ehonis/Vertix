"use client";

import { useState, useEffect } from "react";
import BoulderLeagueBoulderScorer from "./boulder-swiper";
import {
  ClimberStatus,
  BLCompetition,
  BLBoulder,
  BLClimber,
  BLCompletion,
} from "@/generated/prisma/browser";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/contexts/NotificationContext";
import ConfirmationPopUp from "@/app/ui/general/confirmation-pop-up";

type BoulderLeagueScoreScoller = {
  comp: BLCompetition;
  boulders: BLBoulder[];
  climber: BLClimber;
  boulderCompletions: BLCompletion[];
};

export default function BoulderLeagueScoreScroller({
  comp,
  boulders,
  climber,
  boulderCompletions,
}: BoulderLeagueScoreScoller) {
  const [category, setCategory] = useState("Rope");
  const { showNotification } = useNotification();
  const router = useRouter();

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);

  const handleFinish = async () => {
    try {
      const response = await fetch("/api/mixer/comp/finish", {
        method: "POST",
        body: JSON.stringify({
          climberId: climber.id,
        }),
      });
      if (response.ok) {
        showNotification({
          message: "You have finished the competition",
          color: "green",
        });
        router.refresh();
        router.push(`/competitions/mixer/${comp.id}/leaderboard`);
      } else {
        showNotification({
          message: "Failed to finish competition",
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (climber.climberStatus === ClimberStatus.COMPLETED) {
      router.push(`/competitions/mixer/${comp.id}/leaderboard`);
    }
  }, [climber]);

  return (
    <div className="w-screen">
      {showFinishConfirmation && (
        <ConfirmationPopUp
          message="Are you sure you want to finish the competition?"
          submessage="You will not be able to continue scoring after finishing"
          onConfirmation={handleFinish}
          onCancel={() => setShowFinishConfirmation(false)}
        />
      )}
      <div className="flex flex-col p-5 pt-3 pb-1">
        <div className="mb-1 flex justify-between max-w-md gap-5 md:max-w-lg place-self-center">
          {/* TODO : countdown timer */}
          {/* <MixerCountdownTimer
            timeAllotted={comp.time}
            startedAt={comp.startedAt}
            onFinish={handleFinish}
          /> */}

          <button
            onClick={() => setShowFinishConfirmation(true)}
            className="text-sm flex items-center justify-center gap-1 text-white font-barlow font-semibold"
          >
            <div className="bg-green-500 rounded px-2 py-2">
              <p>Finish</p>
            </div>
          </button>
        </div>
      </div>

      <div className={category === "Rope" ? "block" : "hidden"}></div>
      <div className={category === "Boulder" ? "block" : "hidden"}>
        <BoulderLeagueBoulderScorer
          compId={comp.id}
          climberId={climber.id}
          boulders={boulders}
          boulderCompletions={boulderCompletions}
        />
      </div>
    </div>
  );
}
