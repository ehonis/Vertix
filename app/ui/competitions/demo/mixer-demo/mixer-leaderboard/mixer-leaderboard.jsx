"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function MixerLeaderBoard({
  user,
  combinedScores,
  adjustedRankings,
  boulderScoresRanked,
  ropeScoresRanked,
}) {
  const [isReady, setIsReady] = useState(false);
  const [isBoulders, setIsBoulders] = useState(false);
  const [isRopes, setIsRopes] = useState(false);
  const [isTotalCombinedScores, setIsTotalCombinedScores] = useState(false);

  const [openDivisions, setOpenDivisions] = useState({});
  useEffect(() => {
    const storedIsReady = localStorage.getItem("isReady");
    if (storedIsReady === "true") {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isReady", isReady);
  }, [isReady]);
  const handleToggleDivision = divisionName => {
    setOpenDivisions(prev => ({
      ...prev,
      [divisionName]: !prev[divisionName], // Toggle true/false
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
              By clicking this button, you will be able to view all scores for the Spring Mixer
              2024!
            </p>
            <button
              onClick={handleViewScores}
              className="text-white bg-green-500 px-3 py-2 rounded-sm font-barlow font-bold w-44 text-2xl shadow-lg shadow-green-500  outline-2 outline-white"
            >
              View Scores
            </button>
            <p className="text-white font-barlow font-bold text-xs text-center">
              If you want to keep the suspense, wait till the scores are announced in person
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          {/* top three */}
          <div className="flex flex-col justify-center items-center p-3 mb-2">
            <h1 className="text-white font-barlow font-bold text-3xl mb-3">Top 3 Overall</h1>
            <div className="h-44 flex gap-2 items-end">
              <div className="flex flex-col items-center">
                <p className="text-white font-barlow font-bold mb-1 text-sm truncate ">
                  {combinedScores[2].name}
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
                  {combinedScores[0].name}
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
                  {combinedScores[1].name}
                </p>
                <motion.div
                  className="h-14 bg-gray-400 w-20 rounded shadow-lg shadow-gray-400"
                  initial={{ height: 0 }}
                  animate={{ height: "6rem" }}
                  transition={{ duration: 0.75, delay: 0.3 }}
                />
              </div>
            </div>

            {/* {combinedScores.slice(0, 3).map((score, index) => (
                <div
                  className={clsx(
                    "flex w-80 rounded-lg justify-start p-2 px-4 items-center  outline-white outline-2",
                    index === 0 && "bg-amber-500 shadow-lg shadow-amber-500", // Gold
                    index === 1 && "bg-gray-400 shadow-lg shadow-gray-400", // Silver
                    index === 2 && "bg-orange-600 shadow-lg shadow-orange-600" // Bronze
                  )}
                  key={index}
                >
                  <p className="text-white font-tomorrow drop-shadow-customBlack text-3xl">
                    {index + 1}
                  </p>
                  <p className="text-white text-lg font-barlow font-bold flex-1 text-center drop-shadow-customBlack">
                    {score.name}
                  </p>
                </div>
              ))} */}
          </div>

          {/* By Division */}
          <div className="flex flex-col gap-3 mb-8 px-6 w-full max-w-3xl">
            <h2 className="font-barlow font-bold text-3xl text-white text-start">By Division</h2>

            {Object.entries(adjustedRankings.updatedDivisions).map(
              ([divisionName, divisionData]) => (
                <div key={divisionName} className="flex flex-col gap-2">
                  {/* Division Button */}
                  <button
                    className={clsx(
                      "bg-slate-900 flex w-full rounded-sm justify-center p-2 outline outline-white",
                      openDivisions[divisionName] && "bg-bg2" // Change color when open
                    )}
                    onClick={() => handleToggleDivision(divisionName)}
                  >
                    <p className="text-white font-barlow font-bold text-center">{divisionName}</p>
                  </button>

                  {/* AnimatePresence for Smooth Open/Close */}
                  <AnimatePresence>
                    {openDivisions[divisionName] && (
                      <motion.div
                        className="flex flex-col w-[95%] max-w-lg gap-1 justify-center items-center bg-bg2 outline outline-white  p-3 self-center rounded-sm"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <motion.div
                          className="w-full max-w-md rounded-sm flex justify-between px-1 py-1"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-white font-barlow font-bold">Rank</p>
                          <p className="text-white font-barlow font-bold">Name</p>
                          <div className="flex flex-col text-center">
                            <p className="text-white font-barlow font-bold">Score</p>
                          </div>
                        </motion.div>
                        {/* Display rankings inside the division */}
                        {divisionData.rankings.map((climber, index) => (
                          <motion.div
                            key={climber.name}
                            className={clsx(
                              "w-full max-w-md rounded-sm flex justify-between px-4 py-1",
                              climber.userId === user?.id && "bg-blue-500",
                              index === 0 && "bg-amber-500 shadow-lg shadow-amber-500",
                              index === 1 && "bg-gray-400 shadow-lg shadow-gray-400",
                              index === 2 && "bg-orange-600 shadow-lg shadow-orange-600",
                              index > 2 && "bg-slate-900"
                            )}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.2 }}
                          >
                            <p className="text-white font-tomorrow">{index + 1}</p>
                            <p className="text-white font-tomorrow">{climber.name}</p>
                            <p className="text-white font-tomorrow">{climber.combinedRank}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            )}
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
                      className="w-full max-w-md rounded-sm grid grid-cols-4 px-1 py-1 text-center"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold">Rank</p>
                      <p className="text-white font-barlow font-bold">Name</p>
                      <p className="text-white font-barlow font-bold">Attempts</p>
                      <p className="text-white font-barlow font-bold">Score</p>
                    </motion.div>
                    {ropeScoresRanked.map(climber => (
                      <motion.div
                        key={climber.name}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-4 px-1 py-1 text-center place-items-center",
                          climber.userId === user?.id && "bg-blue-500",
                          climber.rank === 1 && "bg-amber-500 shadow-lg shadow-amber-500",
                          climber.rank === 2 && "bg-gray-400 shadow-lg shadow-gray-400",
                          climber.rank === 3 && "bg-orange-600 shadow-lg shadow-orange-600",
                          climber.rank > 3 && "bg-slate-900"
                        )}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 * climber.rank,
                          duration: 0.2,
                        }}
                      >
                        <p className="text-white font-tomorrow">{climber.rank}</p>
                        <p className="text-white font-tomorrow text-sm">{climber.name}</p>
                        <p className="text-white font-tomorrow">{climber.attempts}</p>
                        <p className="text-white font-tomorrow">{climber.score}</p>
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
                      className="w-full max-w-md rounded-sm grid grid-cols-4 px-1 py-1 text-center"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold">Rank</p>
                      <p className="text-white font-barlow font-bold">Name</p>
                      <p className="text-white font-barlow font-bold">Attempts</p>
                      <p className="text-white font-barlow font-bold">Score</p>
                    </motion.div>
                    {boulderScoresRanked.map(climber => (
                      <motion.div
                        key={climber.name}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-4 px-1 py-1 text-center place-items-center",
                          climber.userId === user?.id && "bg-blue-500",
                          climber.rank === 1 && "bg-amber-500 shadow-lg shadow-amber-500",
                          climber.rank === 2 && "bg-gray-400 shadow-lg shadow-gray-400",
                          climber.rank === 3 && "bg-orange-600 shadow-lg shadow-orange-600",
                          climber.rank > 3 && "bg-slate-900"
                        )}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 * climber.rank,
                          duration: 0.2,
                        }}
                      >
                        <p className="text-white font-tomorrow">{climber.rank}</p>
                        <p className="text-white font-tomorrow text-sm">{climber.name}</p>
                        <p className="text-white font-tomorrow">{climber.attempts}</p>
                        <p className="text-white font-tomorrow">{climber.score}</p>
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
                      className="w-full max-w-md rounded-sm grid grid-cols-5 px-1 py-1 text-center"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-white font-barlow font-bold text-xs">Rank</p>
                      <p className="text-white font-barlow font-bold text-xs">Name</p>
                      <p className="text-white font-barlow font-bold text-xs">Boulder</p>
                      <p className="text-white font-barlow font-bold text-xs">Rope</p>
                      <p className="text-white font-barlow font-bold text-xs">Combined</p>
                    </motion.div>
                    {combinedScores.map((climber, index) => (
                      <motion.div
                        key={climber.name}
                        className={clsx(
                          "w-full max-w-md rounded-sm grid grid-cols-5 px-1 py-1 text-center place-items-center",
                          climber.userId === user?.id && "bg-blue-500",
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
                        <p className="text-white font-tomorrow">{index + 1}</p>
                        <p className="text-white font-tomorrow text-sm">{climber.name}</p>
                        <p className="text-white font-tomorrow">{climber.boulderRank}</p>
                        <p className="text-white font-tomorrow">{climber.ropeRank}</p>
                        <p className="text-white font-tomorrow">{climber.combinedRank}</p>
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
