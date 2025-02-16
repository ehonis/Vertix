'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function InformationalPopUp({ html, onCancel, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 "
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-bg2 p-6 rounded-lg shadow-lg text-white max-w-xs w-full relative"
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
        <h2 className="font-barlow text-xl ">Info</h2>
        <div className="h-[2px] w-full bg-white"></div>
        <span>{html}</span>
      </motion.div>
    </motion.div>
  );
}
