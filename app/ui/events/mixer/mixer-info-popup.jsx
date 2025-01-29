'use client';

import { motion } from 'motion/react';
import {
  getPointPrediction,
  getTopScores,
  getRouteNameById,
} from '@/lib/mixer';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
export default function MixerInfoPopup({
  mixerRoutes,
  completions,
  holds,
  points,
  routeId,
  onCancel,
}) {
  const [predictedHoldsAndPoints, setPredictedHoldsAndPoints] = useState([]);

  const topScores = getTopScores(completions, points);

  useEffect(() => {
    if (topScores.length > 0) {
      setPredictedHoldsAndPoints(
        getPointPrediction(mixerRoutes, topScores, routeId)
      );
    }
  }, []);

  useEffect(() => {
    console.log(predictedHoldsAndPoints);
  });
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
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="relative bg-gray-700 rounded-lg p-5 w-[83%] max-w-md h-1/2 shadow-lg flex flex-col justify-between">
          <button className="absolute top-0 right-0 p-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-barlow text-white ">
              Point Prediction
            </h2>
            <p className="text-gray-300 text-xs font-barlow italic">
              These are holds you need to get too to improve your previous
              score(s)
            </p>
          </div>
          {topScores.length > 0 ? (
            <div className="flex flex-col gap-2">
              {predictedHoldsAndPoints.map((info) => {
                const color = mixerRoutes[info.id].color;
                return (
                  <div className="flex flex-col bg-bg1 p-2 rounded">
                    <p className="text-white font-barlow">
                      Tope Rope Hold:{' '}
                      <span className="font-stalinist gradient-text-blue-cyan">
                        {info.topRopetoBeat.hold}
                      </span>{' '}
                      {' => '}
                      <span className="font-stalinist gradient-text-red-orange">
                        {info.topRopetoBeat.topRopePts}pts
                      </span>
                    </p>
                    <p className="text-white font-barlow">
                      Lead Hold:{' '}
                      <span className="font-stalinist gradient-text-blue-cyan">
                        {info.leadToBeat.hold}
                      </span>
                      {' => '}
                      <span className="font-stalinist gradient-text-red-orange">
                        {info.leadToBeat.leadPts}pts
                      </span>
                    </p>
                    <p className="text-white font-barlow">
                      To beat{' '}
                      <span
                        className={clsx(
                          'font-orbitron font-bold text-2xl',
                          color === 'blue' ? 'text-blue-500' : null,
                          color === 'green' ? 'text-green-400' : null,
                          color === 'orange' ? 'text-orange-500' : null,
                          color === 'yellow' ? 'text-yellow-300' : null,
                          color === 'red' ? 'text-red-500' : null
                        )}
                      >
                        {mixerRoutes[info.id].routeName}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white font-barlow text-center">
              You have not completed any routes. So there is nothing to predict
              yet
            </p>
          )}
          <div></div>
        </div>
      </motion.div>
    </>
  );
}
