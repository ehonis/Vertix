"use client";

import { motion } from "motion/react";
import { getPointPrediction } from "@/lib/mixer";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { MixerRoute } from "@/generated/prisma/browser";

interface PredictionInfo {
  id: string;
  topRopetoBeat: { hold: string; topRopePts: number };
  leadToBeat: { hold: string; leadPts: number };
}

type MixerInfoPopUpData = {
  mixerRoutes: MixerRoute[];
  topScores: [string, number][] | undefined;
  onCancel: () => void;
  routeId: string;
};
export default function MixerInfoPopup({
  mixerRoutes,
  topScores,
  routeId,
  onCancel,
}: MixerInfoPopUpData) {
  const [predictedHoldsAndPoints, setPredictedHoldsAndPoints] = useState<PredictionInfo[]>([]);

  useEffect(() => {
    if (topScores && topScores.length > 0) {
      const predictedPoints = getPointPrediction(mixerRoutes, topScores, routeId);
      console.log(predictedPoints);
      if (predictedPoints.length === 0) {
        setPredictedHoldsAndPoints([]);
      } else {
        setPredictedHoldsAndPoints(predictedPoints);
      }
    }
  }, [mixerRoutes, topScores, routeId]);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Popup Container */}
      <motion.div
        className="fixed inset-0 z-50 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="relative bg-slate-900 rounded-lg p-5 w-[90%] max-w-md h-1/2 shadow-lg flex flex-col justify-between">
          <button className="absolute top-0 right-0 p-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-8 stroke-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-barlow font-bold text-white ">Point Prediction</h2>
            <p className="text-gray-300 text-xs font-barlow font-bold italic">
              These are holds you need to get too to improve your previous score(s)
            </p>
          </div>
          {topScores && topScores.length > 0 && predictedHoldsAndPoints.length > 0 ? (
            <div className="flex flex-col gap-2">
              {predictedHoldsAndPoints.map(info => {
                const foundRoute = mixerRoutes.find(route => route.id === info.id);

                const color = foundRoute ? foundRoute.color : null;
                return (
                  <div className="flex flex-col bg-gray-700 p-2 rounded-sm" key={info.id}>
                    {info.topRopetoBeat.hold && (
                      <div>
                        <p className="text-white font-barlow font-bold">
                          Tope Rope Hold:{" "}
                          <span className="font-mono gradient-text-blue-cyan">
                            {info.topRopetoBeat.hold}
                          </span>{" "}
                          {" → "}
                          <span className="font-mono gradient-text-red-orange">
                            {info.topRopetoBeat.topRopePts}pts
                          </span>
                        </p>
                      </div>
                    )}
                    {info.leadToBeat.hold && (
                      <div>
                        <p className="text-white font-barlow font-bold">
                          Lead Hold:{" "}
                          <span className="font-mono gradient-text-blue-cyan">
                            {info.leadToBeat.hold}
                          </span>
                          {" → "}
                          <span className="font-mono gradient-text-red-orange">
                            {info.leadToBeat.leadPts}pts
                          </span>
                        </p>
                      </div>
                    )}

                    <p className="text-white font-barlow font-bold">
                      To beat{" "}
                      <span
                        className={clsx(
                          "font-mono font-bold text-2xl",
                          color === "blue" ? "text-blue-500" : null,
                          color === "green" ? "text-green-400" : null,
                          color === "orange" ? "text-orange-500" : null,
                          color === "yellow" ? "text-yellow-300" : null,
                          color === "red" ? "text-red-500" : null
                        )}
                      >
                        {foundRoute?.name}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white font-barlow font-bold text-center">
              Either you have completed climbs that climbing this route would not affect your score,
              or you have not climbed any routes.
            </p>
          )}
          <div></div>
        </div>
      </motion.div>
    </>
  );
}
