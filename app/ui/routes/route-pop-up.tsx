import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { RouteCompletion, RouteAttempt, CommunityGrade, User } from "@prisma/client";
import Link from "next/link";
import clsx from "clsx";
import { getBoulderGradeMapping, getGradeRange } from "@/lib/route";

export default function RoutePopUp({
  id,
  grade,
  name,
  onCancel,
  user,
  color,
  completions,
  attempts,
  userGrade,
  communityGrade,
}: {
  id: string;
  grade: string;
  name: string;
  onCancel: () => void;
  user: User | null | undefined;
  color: string;
  completions: number;
  attempts: number;
  userGrade: string | null;
  communityGrade: string | null;
}) {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [isFrontendCompleted, setIsFrontendCompleted] = useState(false);
  const [isAttemptLoading, setIsAttemptLoading] = useState(false);
  const [isGradeLoading, setIsGradeLoading] = useState(false);
  const [frontendCompletions, setFrontendCompletions] = useState(completions || 0);
  const [frontendAttempts, setFrontendAttempts] = useState(attempts || 0);
  const [frontendCommunityGrade, setFrontendCommunityGrade] = useState("");
  const [gradeMapped, setGradeMapped] = useState("");
  const [gradeRange, setGradeRange] = useState<string[]>(getGradeRange(grade));

  const [selectedGrade, setSelectedGrade] = useState("");

  const handleRouteCompletion = async () => {
    if (!user) {
      showNotification({
        message:
          "Not sure how you  got here, but you cant complete this route because your not signed in",
        color: "red",
      });
      return;
    }
    try {
      const data = { userId: user.id, routeId: id };
      setIsCompletionLoading(true);
      const response = await fetch("/api/routes/complete-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        showNotification({ message: responseData.message, color: "red" });
      } else {
        showNotification({
          message: `Successfully completed ${name}`,
          color: "green",
        });
        setIsFrontendCompleted(true);
        setFrontendCompletions(prev => prev + 1);
        router.refresh();
      }
    } catch (error) {
      showNotification({ message: "Error trying to complete route", color: "red" });
    } finally {
      setIsCompletionLoading(false);
    }
  };
  const handleRouteAttempt = async () => {
    if (!user) {
      showNotification({
        message:
          "Not sure how you got here, but you cant attempt this route because your not signed in",
        color: "red",
      });
      return;
    }
    try {
      const data = { userId: user.id, routeId: id };
      setIsAttemptLoading(true);
      const response = await fetch("/api/routes/attempt-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        showNotification({ message: responseData.message, color: "red" });
      } else {
        showNotification({
          message: `Successfully attempted ${name}`,
          color: "green",
        });

        setFrontendAttempts(prev => prev + 1);
        router.refresh();
      }
    } catch (error) {
      showNotification({ message: "Error trying to attempt route", color: "red" });
    } finally {
      setIsAttemptLoading(false);
    }
  };
  const handleGradeSubmission = async () => {
    setIsGradeLoading(true);
    if (!user) {
      showNotification({ message: "You must be signed in to grade a route", color: "red" });
      return;
    }
    try {
      const data = { userId: user.id, routeId: id, selectedGrade: selectedGrade };
      const response = await fetch("/api/routes/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({ message: "Error trying to grade route", color: "red" });
      } else {
        showNotification({ message: "Successfully graded route", color: "green" });
        setFrontendCommunityGrade(selectedGrade);
      }
    } catch (error) {
      showNotification({ message: "Error trying to grade route", color: "red" });
    } finally {
      setIsGradeLoading(false);
    }
  };

  useEffect(() => {
    if (grade.startsWith("v")) {
      setGradeMapped(getBoulderGradeMapping(grade));
    } else {
      setGradeMapped(grade);
    }
  }, [grade]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            "bg-slate-900/35 p-3 rounded-lg shadow-lg text-white max-w-[22rem] w-full relative flex flex-col gap-10 z-30 outline-2 h-max justify-between",
            {
              "outline-green-400": color === "green",
              "outline-red-400": color === "red",
              "outline-blue-400": color === "blue",
              "outline-yellow-400": color === "yellow",
              "outline-purple-400": color === "purple",
              "outline-orange-400": color === "orange",
              "outline-white": color === "white",
              "outline-black": color === "black",
              "outline-pink-400": color === "pink",
            }
          )}
          onClick={e => e.stopPropagation()}
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8 stroke-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex gap-2 items-center">
            {(completions > 0 || isFrontendCompleted) && (
              <div className="bg-green-400 rounded-full size-10 flex justify-center items-center ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8 stroke-3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            )}
            <div className="flex flex-col w-[90%]">
              <p className="text-3xl font-barlow font-bold max-w-[75%] truncate">{name}</p>
              <p className="italic text-xl font-barlow font-semibold">{gradeMapped}</p>

              <p className="text-sm font-barlow">
                Community Grade:{" "}
                <span className="font-bold">
                  {communityGrade === "none" ? "N/A" : communityGrade}
                </span>
              </p>
            </div>
          </div>

          {!user ? (
            <div className="flex flex-col ">
              <p className="text-lg text-center">
                To complete or attempt this route you must be signed in
              </p>
              <Link
                href={"/signin"}
                className="p-2 bg-purple-600 rounded text-lg font-bold text-center"
              >
                Sign In!
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 justify-center items-center">
              <p className="font-barlow font-semibold text-lg">Quick Actions</p>
              <div className="flex w-4/5 justify-between">
                <div className="flex flex-col gap-2 items-center">
                  <button
                    className="bg-gray-400/45 outline outline-gray-300 p-2 px-3 rounded-full shadow font-semibold font-barlow text-2xl"
                    onClick={handleRouteAttempt}
                  >
                    {isAttemptLoading ? <ElementLoadingAnimation /> : "Attempt"}
                  </button>
                  {frontendAttempts > 0 && (
                    <div className="">
                      {frontendAttempts} attempt{"(s)"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    className="bg-green-400/45 outline outline-green-400  p-2 px-3 rounded-full shadow font-semibold font-barlow text-2xl"
                    onClick={handleRouteCompletion}
                  >
                    {isCompletionLoading ? <ElementLoadingAnimation /> : "Complete"}
                  </button>
                  {(frontendCompletions > 0 || isFrontendCompleted) && (
                    <div className="">
                      {frontendCompletions} send{"(s)"}
                    </div>
                  )}
                </div>
              </div>

              {!userGrade ? (
                <div className="flex flex-col gap-2 items-center mt-5">
                  <p className="font-barlow font-semibold text-lg">Grade it Yourself!</p>
                  <select
                    className="bg-gray-400/45 outline outline-gray-300 p-2 px-3 rounded shadow font-semibold font-barlow text-2xl"
                    onChange={e => setSelectedGrade(e.target.value)}
                    value={selectedGrade}
                  >
                    <option value={""}>Select a Grade</option>
                    {gradeRange.map(grade => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  {selectedGrade !== "" && !frontendCommunityGrade && (
                    <button
                      className=" bg-green-500  p-2 px-3 rounded-full shadow font-semibold font-barlow text-xl"
                      onClick={handleGradeSubmission}
                    >
                      {isGradeLoading ? <ElementLoadingAnimation /> : "Submit"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-center mt-5">
                  <p className="text-center">
                    You graded this climb a{" "}
                    <span className="font-bold">{userGrade.toUpperCase()}</span>, to change your
                    grade go to the route page
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="text-xs text-center">
              Add & view completions, attempts, community grades, stars here
            </p>
            <Link
              href={`/routes/${id}`}
              className="p-2 bg-blue-600 rounded text-center text-nowrap flex gap-2 font-semibold"
            >
              Route Page
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
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
