"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import clsx from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { MixerCompletion } from "@prisma/client";
import { MixerClimber } from "@prisma/client";
import { CompletionType } from "@prisma/client";
type CompletionsUserPopUpData = {
  onCancel: () => void;
  climber: MixerClimber;
};
export default function AllCompletionsPopUp({ onCancel, climber }: CompletionsUserPopUpData) {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [completions, setCompletions] = useState<MixerCompletion[]>([]);
  const [ropeCompletions, setRopeCompletions] = useState<
    (MixerCompletion & { mixerRoute: { name: string; color: string } })[]
  >([]);
  const [boulderCompletions, setBoulderCompletions] = useState<MixerCompletion[]>([]);

  useEffect(() => {
    const getCompletions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/mixer/manager/user/get-all-completions?climberId=${climber.id}`
        );
        const data = await response.json();
        setCompletions(data.data);

        setRopeCompletions(
          data.data.filter((completion: MixerCompletion) => completion.type === CompletionType.ROPE)
        );
        setBoulderCompletions(
          data.data.filter(
            (completion: MixerCompletion) => completion.type === CompletionType.BOULDER
          )
        );
        setIsLoading(false);
      } catch (error) {
        showNotification({ message: "Failed to get completions", color: "red" });
        setIsLoading(false);
      }
    };
    getCompletions();
  }, [climber]);
  const handleDeleteCompletion = async (id: string) => {
    try {
      const response = await fetch(`/api/mixer/manager/user/delete-completion`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setCompletions(completions.filter(completion => completion.id !== id));
        setRopeCompletions(ropeCompletions.filter(completion => completion.id !== id));
        setBoulderCompletions(boulderCompletions.filter(completion => completion.id !== id));
        showNotification({ message: "Completion deleted", color: "green" });
      } else {
        showNotification({ message: "Failed to delete completion", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Failed to delete completion", color: "red" });
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-30"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2 outline "
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl">Completions</h2>
          {completions.length === 0 ? (
            isLoading ? (
              <ElementLoadingAnimation />
            ) : (
              <p className="text-gray-400">No completions found</p>
            )
          ) : (
            <>
              <h3 className="text-sm text-gray-400">Rope</h3>
              <div className="flex flex-col gap-2 h-48 overflow-y-scroll">
                {ropeCompletions.map(completion => (
                  <div key={completion.id} className="flex flex-col gap-1 bg-gray-700 rounded p-2">
                    <p>Route {completion.mixerRoute.name}</p>
                    <p>Attempts: {completion.attempts}</p>
                    <p>Points: {completion.points}</p>
                    {completion.type === CompletionType.ROPE && (
                      <p>Hold #: {completion.holdNumber}</p>
                    )}
                    <div className="flex gap-2 items-center">
                      <label htmlFor="foulPlay" className="">
                        Foul Play?
                      </label>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded max-w-fit text-sm"
                        onClick={() => handleDeleteCompletion(completion.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="text-sm text-gray-400">Boulder</h3>
              <div className="flex flex-col gap-2 h-48 overflow-y-scroll">
                {boulderCompletions.map(completion => (
                  <div key={completion.id} className="flex flex-col gap-1 bg-gray-700 rounded p-2">
                    <p>Attempts: {completion.attempts}</p>
                    <p>Points: {completion.points}</p>
                    <div className="flex gap-2 items-center">
                      <label htmlFor="foulPlay" className="">
                        Foul Play?
                      </label>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded max-w-fit text-sm"
                        onClick={() => handleDeleteCompletion(completion.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
