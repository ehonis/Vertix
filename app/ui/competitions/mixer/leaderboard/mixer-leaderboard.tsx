"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClimberStanding, DivisionStanding, Score } from "@/lib/mixers";
import { User } from "next-auth";
import { MixerCompetition } from "@prisma/client";
type Props = {
  comp: MixerCompetition;
  user: User | null;
  combinedScores: ClimberStanding[];
  adjustedRankings: DivisionStanding[];
  boulderScoresRanked: Score[];
  ropeScoresRanked: Score[];
  originalDivisionStandings: DivisionStanding[];
};
export default function MixerLeaderBoard({
  comp,
  user,
  combinedScores,
  adjustedRankings,
  boulderScoresRanked,
  ropeScoresRanked,
  originalDivisionStandings,
}: Props) {
  const [isReady, setIsReady] = useState(false);
  const [isBoulders, setIsBoulders] = useState(false);
  const [isRopes, setIsRopes] = useState(false);
  const [isTotalCombinedScores, setIsTotalCombinedScores] = useState(false);
  const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});

  const handleToggleDivision = (divisionName: string) => {
    setOpenDivisions(prev => ({
      ...prev,
      [divisionName]: !prev[divisionName],
    }));
  };

  const handleViewScores = () => {
    setIsReady(true);
  };
  const handleBoulderScores = () => {
    setIsBoulders(!isBoulders);
  };
  const handleRopeScores = () => {
    setIsRopes(!isRopes);
  };
  const handleCombinedScores = () => {
    setIsTotalCombinedScores(!isTotalCombinedScores);
  };
  return (
    <>
      {!isReady ? (
        <div className="flex flex-col h-screen-offset items-center justify-start py-10 px-10">
          <h1 className="text-white font-barlow font-bold text-5xl text-center">
            Scores Are Ready!
          </h1>
          <div className="flex-1 justify-center flex flex-col gap-3 items-center">
            <p className="text-white font-barlow font-bold text-center">
              By clicking this button, you will be able to view all scores for the {comp.name}
            </p>
            <p className="text-white font-barlow font-bold text-xs text-center">
              If you want to keep the suspense, wait till the scores are announced in person
            </p>
            <button
              onClick={handleViewScores}
              className="text-white bg-green-500 px-3 py-2 rounded-sm font-barlow font-bold w-44 text-2xl shadow-lg shadow-green-500  outline-2 outline-white"
            >
              View Scores
            </button>
          </div>
        </div>
      ) : (
        // <div></div>
        <div className="flex flex-col justify-center items-center">
          {/* top three */}
          <div className="flex flex-col justify-center items-center p-3 mb-2">
            <h1 className="text-white font-barlow font-bold text-3xl mb-3">Top 3 Overall</h1>
            <div className="h-44 flex gap-2 items-end">
              <div className="flex flex-col items-center">
                <p className="text-white font-barlow font-bold mb-1 text-sm truncate ">
                  {combinedScores[2].climberName}
                </p>
                <motion.div
                  className="h-6 bg-orange-600 w-20 rounded shadow-lg shadow-orange-600"
                  initial={{ height: 0 }}
                  animate={{ height: "3rem" }}
                  transition={{ duration: 0.75, delay: 0.4 }}
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-white font-barlow font-bold mb-1 text-sm truncate ">
                  {combinedScores[0].climberName}
                </p>
                <motion.div
                  className="h-20 bg-amber-500 w-20 rounded shadow-lg shadow-amber-500"
                  initial={{ height: 0 }}
                  animate={{ height: "10rem" }}
                  transition={{ duration: 0.75, delay: 0.2 }}
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-white font-barlow font-bold mb-1 text-sm truncate ">
                  {combinedScores[1].climberName}
                </p>
                <motion.div
                  className="h-14 bg-gray-400 w-20 rounded shadow-lg shadow-gray-400"
                  initial={{ height: 0 }}
                  animate={{ height: "6rem" }}
                  transition={{ duration: 0.75, delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* By Division */}
          <div className="flex flex-col gap-3 mb-8 px-6 w-full max-w-3xl">
            <h2 className="font-barlow font-bold text-3xl text-white text-start">By Division</h2>
            <AnimatePresence>
              {adjustedRankings.map(division => (
                <div key={division.divisionName} className="w-full flex flex-col gap-2">
                  <button onClick={() => handleToggleDivision(division.divisionName)}>
                    <h3 className="font-barlow font-bold text-white text-center bg-slate-900 rounded-sm p-2 outline outline-white">
                      {division.divisionName}
                    </h3>
                  </button>
                  <div></div>
                  {openDivisions[division.divisionName] && (
                    <div className="flex flex-col w-[95%] max-w-lg gap-1 justify-center items-center bg-bg2  outline-white outline-1 p-3 self-center rounded-sm">
                      <div className="w-full grid grid-cols-3 gap-1 text-white p-1 rounded items-center font-barlow font-bold ">
                        <p className="text-start font-bold">Name</p>
                        <p className="text-center col-span-1 font-bold">Boulder Place</p>
                        <p className="text-end col-span-1 font-bold">Rope Place</p>
                      </div>
                      {division.climbers.map(climber => (
                        <motion.div
                          key={climber.climberName}
                          className={clsx(
                            "grid grid-cols-3 gap-1 text-white p-2 rounded w-full items-center font-tomorrow",
                            division.climbers.indexOf(climber) === 0 &&
                              "bg-amber-500 shadow-lg shadow-amber-500",
                            division.climbers.indexOf(climber) === 1 &&
                              "bg-gray-400 shadow-lg shadow-gray-400",
                            division.climbers.indexOf(climber) === 2 &&
                              "bg-orange-600 shadow-lg shadow-orange-600",
                            division.climbers.indexOf(climber) > 2 && "bg-slate-900"
                          )}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                            delay: 0.05 * division.climbers.indexOf(climber),
                          }}
                        >
                          <div className="flex items-center gap-1.5 ">
                            <p className="font-bold">{division.climbers.indexOf(climber) + 1}</p>
                            <p className="text-nowrap truncate">{climber.climberName}</p>
                          </div>
                          <p className="col-span-1 text-center ">{climber.boulderPlace}</p>
                          <p className="col-span-1 text-end ">{climber.ropePlace}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total Scores by Type */}
          <div className="flex flex-col gap-3 mb-8 px-6 w-full max-w-3xl">
            <h2 className="font-barlow font-bold text-3xl text-white text-start">
              Total Scores by Type
            </h2>
            {/* ropes */}
            <div className="flex flex-col gap-2">
              {/* Ropes Button */}
              <button
                className={clsx(
                  "bg-slate-900 flex w-full rounded-sm justify-center p-2 outline-1 outline-white",
                  isRopes && "bg-bg2"
                )}
                onClick={handleRopeScores}
              >
                <p className="text-white font-barlow font-bold text-center">Ropes</p>
              </button>

              {/* Ropes Scores List */}
              <AnimatePresence>
                {isRopes && (
                  <motion.div
                    className="flex flex-col w-[95%] max-w-lg gap-1 justify-center items-center bg-bg2  outline-white outline-1 p-3 self-center rounded-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="w-full max-w-md rounded-sm grid grid-cols-3 px-1 py-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold justify-self-start">Name</p>
                      <p className="text-white font-barlow font-bold text-center">Attempts</p>
                      <p className="text-white font-barlow font-bold justify-self-end">Score</p>
                    </motion.div>
                    {ropeScoresRanked.map(climber => (
                      <motion.div
                        key={climber.climberName}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-3 px-2 py-1 text-center",
                          ropeScoresRanked.indexOf(climber) === 0 &&
                            "bg-amber-500 shadow-lg shadow-amber-500",
                          ropeScoresRanked.indexOf(climber) === 1 &&
                            "bg-gray-400 shadow-lg shadow-gray-400",
                          ropeScoresRanked.indexOf(climber) === 2 &&
                            "bg-orange-600 shadow-lg shadow-orange-600",
                          ropeScoresRanked.indexOf(climber) > 2 && "bg-slate-900"
                        )}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 * ropeScoresRanked.indexOf(climber) + 1,
                          duration: 0.2,
                        }}
                      >
                        <div className="flex items-center gap-1.5 justify-self-start">
                          <p className="text-white font-tomorrow font-bold">
                            {ropeScoresRanked.indexOf(climber) + 1}
                          </p>
                          <p className="text-white font-tomorrow text-sm truncate">
                            {climber.climberName}
                          </p>
                        </div>
                        <p className="text-white font-tomorrow text-center">{climber.attempts}</p>
                        <p className="text-white font-tomorrow text-end col-span-1">
                          {climber.score}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Boulders */}
            <div className="flex flex-col gap-2">
              {/* Boulders Button */}
              <button
                className={clsx(
                  "bg-slate-900 flex w-full rounded-sm justify-center p-2  outline-1 outline-white",
                  isBoulders && "bg-bg2"
                )}
                onClick={handleBoulderScores}
              >
                <p className="text-white font-barlow font-bold text-center">Boulders</p>
              </button>

              {/* Boulders Scores List */}
              <AnimatePresence>
                {isBoulders && (
                  <motion.div
                    className="flex flex-col w-[95%] max-w-lg gap-1 justify-center items-center bg-bg2  outline-white outline-1 p-3 self-center rounded-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="w-full max-w-md rounded-sm grid grid-cols-3 px-1 py-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold justify-self-start">Name</p>
                      <p className="text-white font-barlow font-bold text-center">Attempts</p>
                      <p className="text-white font-barlow font-bold justify-self-end">Score</p>
                    </motion.div>
                    {boulderScoresRanked.map(climber => (
                      <motion.div
                        key={climber.climberName}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-3 px-2 py-1 text-center",
                          boulderScoresRanked.indexOf(climber) === 0 &&
                            "bg-amber-500 shadow-lg shadow-amber-500",
                          boulderScoresRanked.indexOf(climber) === 1 &&
                            "bg-gray-400 shadow-lg shadow-gray-400",
                          boulderScoresRanked.indexOf(climber) === 2 &&
                            "bg-orange-600 shadow-lg shadow-orange-600",
                          boulderScoresRanked.indexOf(climber) > 2 && "bg-slate-900"
                        )}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 * boulderScoresRanked.indexOf(climber) + 1,
                          duration: 0.2,
                        }}
                      >
                        <div className="flex items-center gap-1.5 justify-self-start">
                          <p className="text-white font-tomorrow font-bold">
                            {boulderScoresRanked.indexOf(climber) + 1}
                          </p>
                          <p className="text-white font-tomorrow text-sm truncate">
                            {climber.climberName}
                          </p>
                        </div>
                        <p className="text-white font-tomorrow text-center">{climber.attempts}</p>
                        <p className="text-white font-tomorrow text-end col-span-1">
                          {climber.score}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* total combined scores */}
          <div className="flex flex-col gap-3 mb-20 px-6 w-full max-w-3xl">
            <h2 className="font-barlow font-bold text-3xl text-white text-start">
              Total Combined Scores
            </h2>
            <div className="flex flex-col gap-2">
              <button
                className={clsx(
                  "bg-slate-900 flex w-full rounded-sm justify-center p-2  outline-1 outline-white",
                  isRopes && "bg-bg2"
                )}
                onClick={handleCombinedScores}
              >
                <p className="text-white font-barlow font-bold text-center">Combined Scores</p>
              </button>

              {/* combinedScores list */}
              <AnimatePresence>
                {isTotalCombinedScores && (
                  <motion.div
                    className="flex flex-col w-[95%] max-w-lg gap-1 justify-center items-center bg-bg2  outline-white outline-1 p-3 self-center rounded-sm"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="w-full max-w-md rounded-sm grid grid-cols-4 px-1 py-1 "
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold text-xs justify-self-start">
                        Name
                      </p>
                      <p className="text-white font-barlow font-bold text-xs text-end">Boulder</p>
                      <p className="text-white font-barlow font-bold text-xs text-end">Rope</p>
                      <p className="text-white font-barlow font-bold text-xs text-end">Combined</p>
                    </motion.div>
                    {combinedScores.map((climber, index) => (
                      <motion.div
                        key={climber.climberName}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-4 px-2 py-1 text-center",
                          index === 0 && "bg-amber-500 shadow-lg shadow-amber-500",
                          index === 1 && "bg-gray-400 shadow-lg shadow-gray-400",
                          index === 2 && "bg-orange-600 shadow-lg shadow-orange-600",
                          index > 2 && "bg-slate-900"
                        )}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 * index + 1,
                          duration: 0.2,
                        }}
                      >
                        <div className="flex items-center gap-1.5 justify-self-start">
                          <p className="text-white font-tomorrow font-bold">{index + 1}</p>
                          <p className="text-white font-tomorrow text-sm truncate">
                            {climber.climberName}
                          </p>
                        </div>
                        <p className="text-white font-tomorrow text-end">{climber.boulderPlace}</p>
                        <p className="text-white font-tomorrow text-end">{climber.ropePlace}</p>
                        <p className="text-white font-tomorrow text-end">{climber.overallPlace}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
