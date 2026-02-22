"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import EditUserPopUp from "./user-popup";
import { BLClimber, BLBoulderScore, BLDivision } from "@/generated/prisma/browser";
type UsersData = {
  compId: string;
  climbers: BLClimber[];
  boulderScores: BLBoulderScore[];
  divisions: BLDivision[];
};

export default function UsersComponent({ compId, climbers, boulderScores, divisions }: UsersData) {
  const [compClimbers, setCompClimbers] = useState(climbers); //sets users for rendering
  const [showAllClimbers, setShowAllClimbers] = useState(false); //for user rendering
  const displayedClimbers = showAllClimbers ? compClimbers : compClimbers.slice(0, 10); //for users rendering

  const [foundClimber, setFoundClimber] = useState<BLClimber>(); //for popup
  const [foundBoulderScore, setFoundBoulderScore] = useState<BLBoulderScore>(); //for popup

  const [isEditClimberPopUp, setIsEditClimberPopUp] = useState(false); //for popup rendering
  const [editUserType, setEditUserType] = useState("");

  const handleClimberClick = (climberId: string) => {
    //find functions
    const tempFoundClimber = compClimbers.find(climber => climber.id === climberId);

    const tempFoundBoulderScore = boulderScores.find(score => score.climberId === climberId);
    //set functions

    setFoundBoulderScore(tempFoundBoulderScore);
    setFoundClimber(tempFoundClimber);
    setEditUserType("EDIT");
    setIsEditClimberPopUp(true);
  };

  const handleCancel = () => {
    setIsEditClimberPopUp(false);
  };

  const handleNewUser = () => {
    setFoundBoulderScore(undefined);
    setFoundClimber(undefined);
    setEditUserType("NEW");
    setIsEditClimberPopUp(true);
  };

  useEffect(() => {
    setCompClimbers(climbers);
  }, [climbers]);

  return (
    <div>
      {isEditClimberPopUp && (
        <EditUserPopUp
          compId={compId}
          type={editUserType}
          onCancel={handleCancel}
          climber={foundClimber}
          boulderScore={foundBoulderScore}
          divisions={divisions}
        />
      )}
      <div>
        <h3 className="text-3xl mt-3">Climbers</h3>
        <div className="bg-slate-900 flex-col gap-2 flex p-3 rounded-sm w-full overflow-hidden">
          {compClimbers.length > 0 && (
            <div className="w-full flex-col flex gap-2 overflow-hidden">
              {displayedClimbers.map(climber => (
                <button
                  key={climber.id}
                  className="w-full"
                  onClick={() => handleClimberClick(climber.id)}
                >
                  <div className="grid bg-gray-700 grid-cols-[1fr_auto] items-center p-1 px-2 w-full max-w-full rounded-sm">
                    <p className="text-xl justify-self-start truncate max-w-[90%]">
                      {climber.name}
                    </p>
                    <p
                      className={clsx(
                        "text-base whitespace-nowrap place-self-end font-normal",
                        climber.entryMethod === "APP" ? "text-green-500" : "text-white"
                      )}
                    >
                      {climber.entryMethod}
                    </p>
                  </div>
                </button>
              ))}
              <div className="flex w-full justify-between">
                <div className="flex items-center gap-1">
                  <button
                    className="bg-green-400 p-1 rounded-full max-w-fit"
                    onClick={handleNewUser}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-7 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                  <p className="font-medium">Add Manual User</p>
                </div>
                {compClimbers.length > 10 && (
                  <button
                    className={"px-2 py-1 bg-blue-500 rounded-sm"}
                    onClick={() => setShowAllClimbers(!showAllClimbers)}
                  >
                    {showAllClimbers ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </div>
          )}
          {compClimbers.length === 0 && (
            <div className="flex items-center gap-1" onClick={handleNewUser}>
              <button className="bg-green-400 p-1 rounded-full max-w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-7 "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
              <p className="font-medium">Add Climber</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
