'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

export default function EditUserPopUp({
  onCancel,
  climber,
  boulderScore,
  ropeScore,
}) {
  const [climberName, setClimberName] = useState(climber.name);
  const [entryMethod, setEntryMethod] = useState(climber.entryMethod);

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
          className="bg-bg2 p-3 rounded-lg shadow-lg text-white max-w-sm w-full relative flex flex-col gap-2"
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
          <div className="flex ">
            <input
              type="text"
              value={climberName}
              name=""
              id=""
              onChange={(e) => setClimberName(e.target.value)}
              className="text-white rounded-l bg-bg0 px-2 py-1"
            />
            <p
              className={clsx(
                'font-light bg-bg1 p-1 rounded-r',
                entryMethod === 'MANUAL' ? 'text-gray-300' : 'text-green-400'
              )}
            >
              {entryMethod}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
