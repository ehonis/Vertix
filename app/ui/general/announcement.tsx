"use client";

import { useAnnouncement } from "../../contexts/AnnouncementContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimerAnimation from "./timer-animation";
// import Markdown from "react-markdown";

export default function Announcement() {
  const { announcement, isVisible, dismissAnnouncement } = useAnnouncement();

  const [isDismissAvailable, setIsDismissAvailable] = useState(false);

  const htmlMarkup = `
    <div style="padding: 0.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; text-align: center;">
        Sign up for <span style="color: #3b82f6;">Boulder League</span> now!
      </h2>
      <img
        src="https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJjV3qDcWgPdoxrbYnsw9EMWLqpHRhTeyfCalgO"
        alt="image of boulder league signup"
        width="1000"
        height="1000"
        style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 0.5rem;"
      />
      <p style="margin: 0.5rem 0; text-align: center;">
        Sign up for Boulder League now! Go to the
        <a href="/competitions" style="color: #3b82f6; text-decoration: underline;">
          competitions
        </a>
         page to sign up!
      </p>
      <br />
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; text-align: center;">
        <span style="color: #10b981;">XP Leveling</span> is <span style="color: red;">LIVE</span>
      </h2>
      <img
        src="https://8jiyvthxbb.ufs.sh/f/bujx12z5cHJjkLX4WuV3KDig6VLJbt8p9c5xOQ2GyN7AdFWl"
        alt="image of xp leveling when completing a route"
        width="1000"
        height="1000"
        style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 0.5rem;"
      />
      <p style="margin: 0.5rem 0; text-align: center;">Earn XP by climbing routes and climb the leaderboard! To get a more in depth look at how xp is earned head over to the <a href="/faq" style="color: #3b82f6; text-decoration: underline;">faq</a> page. Along with the new xp system, we are introducing the new leaderboard! check it out at the <a href="/leaderboard" style="color: #3b82f6; text-decoration: underline;">leaderboard</a> page.</p>
    </div>
  `;
  if (!announcement || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/35 outline outline-gray-400 p-2 rounded-lg shadow-lg text-white max-w-sm w-full relative flex flex-col gap-2 h-4/5 "
        >
          {isDismissAvailable ? (
            <button
              className="absolute top-2 right-2  hover:text-white"
              onClick={dismissAnnouncement}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke=""
                className="size-8 stroke-2 stroke-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="absolute top-2 right-2">
              <TimerAnimation
                duration={5}
                onComplete={() => setIsDismissAvailable(true)}
                size={30}
                color="white"
                strokeWidth={4}
              />
            </div>
          )}

          <h2 className="font-barlow font-bold text-2xl mb-2 pr-8 ">{announcement.title}</h2>

          <div className="h-[2px] w-full bg-white mb-4"></div>

          <div
            className="text-gray-300 overflow-y-scroll"
            dangerouslySetInnerHTML={{ __html: announcement.body }}
          />

          {/* Debug: Show raw content */}
          {/* <details className="mt-2 text-xs text-gray-500">
            <summary>Debug: Raw content</summary>
            <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-auto">
              {JSON.stringify(announcement.body, null, 2)}
            </pre>
          </details> */}

          {isDismissAvailable && (
            <button
              onClick={dismissAnnouncement}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-barlow font-bold py-2 px-4 rounded transition-colors"
            >
              Got it!
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
