"use client";

import { useState, ReactNode } from "react"; // Import ReactNode
import Link from "next/link";

// Define an interface for the FAQ item structure
interface FAQItem {
  q: string;
  a: ReactNode; // Use ReactNode for JSX content
}

export default function FAQPage() {
  const [openStates, setOpenStates] = useState<Record<number, boolean>>({}); // Add type annotation

  const faqContent: FAQItem[] = [
    {
      q: "What is Vertix alpha?",
      a: (
        <p>
          <span className="font-jost font-bold italic text-purple-500">Vertix</span> is an
          interactive web application designed to enhance your climbing gym experience by providing
          detailed route tracking, community features like grades and ratings, and engaging
          real-time competitions.
          <br />
          <br /> <span className="text-red-500 font-jost">alpha </span>refers to the stage of
          development of Vertix. Right now very little features are actually included in the alpha
          stage. Many more features to come in the beta and full release
        </p>
      ),
    },
    {
      q: "Do I need to make an account?",
      a: (
        <p>
          Yes, most of Vertix&apos;s features require an account to personalize your experience and
          track your progress. Signing up is easy, just head to the{" "}
          <Link href={"/signin"} className="underline text-blue-500 hover:text-blue-400">
            sign in page
          </Link>{" "}
          where you can create your account.
        </p>
      ),
    },
    {
      q: "How do I sign up for Comps?",
      a: (
        <p>
          First, you need an account with Vertix. After creating an account with Vertix, head to the{" "}
          <Link href={"/competitions"}>Competitions</Link> page and find the upcoming comp. All you
          need is your name and pick what division you want to be in and click sign up.
        </p>
      ),
    },
    {
      q: "What will a real time comp look like?",
      a: (
        <p>
          After signing up for the upcoming comp, on the comp day, the comp page will change to in
          progress and you can start submitting your points. After the comp time is up, all
          unsubmitted points will be submitted and the point calculation will be done. After the
          point calculation is done, the leaderboard will be released
        </p>
      ),
    },
    {
      q: "I found a bug, Can I report it?",
      a: (
        <p>
          Absolutely! We appreciate bug reports. Please submit them via email to{" "}
          <a
            href="mailto:support@vertixclimb.com"
            className="underline text-blue-500 hover:text-blue-400"
          >
            support@vertixclimb.com
          </a>
          .
        </p>
      ),
    },
    {
      q: "Do I need to pay for anything?",
      a: (
        <p>
          No, Vertix&apos;s core features are completely free. We plan to introduce an optional
          &apos;premium&apos; tier in the future using a &apos;Pay What You Want&apos; model. This
          is primarily a way to support the platform&apos;s development, but it will also unlock
          some additional features beyond the free experience.
        </p>
      ),
    },
    {
      q: "How is xp calculated per route?",
      a: (
        <div className="flex flex-col gap-2">
          <p className="font-bold">
            XP is calculated based on the difficulty of the route, your highest grade, the number of
            your sends, and if it is your first time completing the route.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <p>- The base xp for a route is determined by the grade of the route.</p>
            <p>- The first time you complete a route, you will receive a bonus xp.</p>
            <p>- The more times you complete a route, the less xp you will receive per send.</p>
            <p>
              - If you complete a route at a higher grade than your current highest grade, you will
              receive a bonus xp.
            </p>
            <p>
              - For feature routes, you will a recieve a one time amount of extra xp. Every send
              after will result in no xp.
            </p>
          </div>
        </div>
      ),
    },
    {
      q: "How is the leaderboard calculated?",
      a: (
        <p>
          The leaderboard is calculated based on the xp you have earned. The leaderboard is updated
          every time you submit a route
        </p>
      ),
    },
  ];

  // Function to toggle the open state for a specific index
  const toggleFAQ = (index: number): void => {
    // Add type annotation for index and return type
    setOpenStates(prevStates => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  return (
    <div className="w-full mt-10 font-barlow text-white flex flex-col items-center px-4">
      <div className="w-full max-w-xs md:max-w-md">
        <h1 className="font-bold italic text-3xl md:text-left">Frequently Asked Questions</h1>
      </div>
      <div className="w-full max-w-xs md:max-w-md h-1 rounded-full bg-white mt-1" />{" "}
      {/* Added mt-1 */}
      <div className="mt-5 w-full max-w-xs md:max-w-md flex flex-col gap-3">
        {" "}
        {/* Changed gap-5 to gap-3 */}
        {faqContent.map((content, index) => (
          // Use a div to wrap the button and the answer content
          <div key={index} className="w-full rounded-md bg-slate-900 overflow-hidden">
            {" "}
            {/* Added overflow-hidden */}
            <button
              onClick={() => toggleFAQ(index)} // Call toggle function on click
              className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-800 transition-colors duration-150" // Added hover effect & text-left
            >
              <p className="font-medium">{content.q}</p> {/* Added font-medium */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                // Rotate arrow based on open state, add transition
                className={`size-6 transition-transform duration-200 ease-in-out ${
                  openStates[index] ? "rotate-180" : ""
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {/* Conditionally render the answer based on open state */}
            {openStates[index] && (
              <div className="p-3 pt-0 text-left text-gray-300">
                {" "}
                {/* Added padding (except top), text-left, lighter text */}
                {content.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
