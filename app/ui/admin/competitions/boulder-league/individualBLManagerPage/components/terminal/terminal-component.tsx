"use client";

import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { useEffect, useState } from "react";

export default function TerminalComponent({ compId }: { compId: string }) {
  const [events, setEvents] = useState<
    {
      id: string;
      climberName: string;
      date: string;
      type: string;
      boulderName?: string;
      routeName?: string;
      attempts?: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/mixer/manager/terminal?compId=${compId}`);
    const data = await response.json();
    console.log(data.data);
    setEvents(data.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    console.log(events);
  }, []);

  // Add useEffect to scroll to bottom when events change
  useEffect(() => {
    const terminalContainer = document.querySelector(".overflow-y-auto");
    if (terminalContainer) {
      terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
  }, [events]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 mt-3 w-sm md:w-full">
        <div className="flex justify-between gap-3">
          <h2 className="font-barlow font-bold text-3xl text-white">Terminal</h2>
          <button onClick={handleRefresh} className=" text-white rounded-md">
            {!isLoading ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75 12 21l7.5-8.25L12 3z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-col text-xs bg-slate-900 w-full p-3 rounded-md">
          <div className="flex flex-col bg-black p-2 rounded-md w-full h-96 overflow-y-auto">
            {isLoading ? (
              <ElementLoadingAnimation />
            ) : events.length > 0 ? (
              events.map(event => {
                if (event.type === "BOULDER_COMPLETION") {
                  return (
                    <p key={event.id} className="font-barlow font-bold text-white">
                      <span className="text-green-500">{event.climberName}</span> saved{" "}
                      <span className="text-purple-500">{event.boulderName}</span> with{" "}
                      <span className="text-white">{event.attempts}</span> attempt(s) on{" "}
                      <span className="text-blue-500">{event.date}</span>
                    </p>
                  );
                } else if (event.type === "ROPE_COMPLETION") {
                  return (
                    <p key={event.id} className="font-barlow font-bold  text-white">
                      <span className="text-green-500">{event.climberName}</span> saved{" "}
                      <span className="text-purple-500">{event.routeName}</span> with{" "}
                      <span className="text-white">{event.attempts}</span> attempt(s) on{" "}
                      <span className="text-blue-500">{event.date}</span>
                    </p>
                  );
                } else if (event.type === "SIGN_UP") {
                  return (
                    <p key={event.id} className="font-barlow font-bold  text-white">
                      <span className="text-green-500">{event.climberName}</span> signed up on{" "}
                      <span className="text-blue-500">{event.date}</span>
                    </p>
                  );
                }
              })
            ) : (
              <p className="font-barlow font-bold text-xl text-white">No events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
