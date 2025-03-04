'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import Image from 'next/image';
export default function EditUserPopUp({
  onCancel,
  climber,
  boulderScore,
  ropeScore,
}) {
  //user data
  const [climberName, setClimberName] = useState(climber.name);
  const [entryMethod, setEntryMethod] = useState(climber.entryMethod);
  const [connectedUser, setConnectedUser] = useState(null);

  //user route data
  const [tempBoulderScore, setTempBoulderScore] = useState(boulderScore.score);
  const [tempRopeScore, setTempRopeScore] = useState(ropeScore.score);
  const [tempBoulderAttempts, setTempBoulderAttempts] = useState(
    boulderScore.attempts
  );
  const [tempRopeAttempts, setTempRopeAttempts] = useState(ropeScore.attempts);

  useEffect(() => {
    const getConnectUser = async () => {
      const queryData = new URLSearchParams({
        userId: climber.userId,
      });
      try {
        const response = await fetch(
          `/api/mixer/manager/getMixerUser?${queryData.toString()}`
        );
        if (!response.ok) {
          console.log('error');
        }
        const result = await response.json();
        return result.user;
      } catch (error) {
        console.error(error);
      }
    };

    const setConnectedUserAsync = async () => {
      if (entryMethod === 'APP') {
        const user = await getConnectUser(); // Await the result
        setConnectedUser(user);
        console.log(user);
      }
    };

    setConnectedUserAsync();
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-xl">Climber Editor</h2>
          {/* name and entryMethod */}
          <div className="flex justify-center">
            <input
              type="text"
              value={climberName}
              name=""
              id=""
              onChange={(e) => setClimberName(e.target.value)}
              className="text-white rounded-l bg-bg0 px-2 py-1 w-48"
            />
            <select
              name=""
              id=""
              value={entryMethod}
              onChange={(e) => setEntryMethod(e.target.value)}
              className={clsx(
                'font-light bg-bg1 p-1 rounded-r text-center w-24',
                entryMethod === 'MANUAL' ? 'text-gray-300' : 'text-green-400'
              )}
            >
              <option value="APP">APP</option>
              <option value="MANUAL">MANUAL</option>
            </select>
          </div>
          {/* connected user */}
          {connectedUser !== null && (
            <div className="flex justify-center">
              <div className="flex bg-bg1 items-center p-2 rounded w-72 justify-between">
                {/* user image */}
                <div className="flex gap-2">
                  {connectedUser.image !== null ? (
                    <Image
                      src={connectedUser.image}
                      width={48}
                      height={48}
                      className="rounded-full size-12 self-center"
                      alt="picture of user"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                  <div className="flex flex-col gap-0 self-center">
                    <p className="text-lg truncate max-w-max">
                      {connectedUser.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate w-18 -mt-2">
                      @{connectedUser.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* boulder scores */}
          <div className="flex flex-col bg-bg1 rounded p-2 gap-2 w-72 place-self-center">
            <p>Boulder Scores Combined</p>
            <div className="flex gap-2 items-center">
              <label htmlFor="" className="text-sm">
                Score:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempBoulderScore}
                onChange={(e) => setTempBoulderScore(e.target.value)}
                className="w-16 bg-white text-bg1 rounded px-2  text-sm"
              />
              <label htmlFor=" " className="text-sm">
                Attempts:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempBoulderAttempts}
                onChange={(e) => setTempBoulderAttempts(e.target.value)}
                className="w-10 bg-white text-bg1 rounded px-2 text-sm"
              />
            </div>
          </div>
          {/* rope scores */}
          <div className="flex flex-col bg-bg1 rounded p-2 gap-2 w-72 place-self-center">
            <p>Ropes Scores Combined</p>
            <div className="flex gap-2 items-center">
              <label htmlFor="" className="text-sm">
                Score:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempRopeScore}
                onChange={(e) => setTempRopeScore(e.target.value)}
                className="w-16 bg-white text-bg1 rounded px-2 text-sm"
              />
              <label htmlFor="" className="text-sm">
                Attempts:
              </label>
              <input
                type="text"
                name=""
                id=""
                value={tempBoulderAttempts}
                onChange={(e) => setTempRopeAttempts(e.target.value)}
                className="w-10 bg-white text-bg1 rounded px-2 text-sm"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
