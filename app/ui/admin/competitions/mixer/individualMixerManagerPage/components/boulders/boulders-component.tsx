"use client";
import { useEffect, useState } from "react";
import EditBoulderPopUp from "./edit-boulder-popup";
import NewBoulderPopUp from "./new-boulder-pop-up";
import { clsx } from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { MixerBoulder } from "@prisma/client";

type BouldersComponentData = {
  boulders: MixerBoulder[];
  compId: string;
};
export default function BoulderComponent({ boulders, compId }: BouldersComponentData) {
  const { showNotification } = useNotification();
  const [compBoulders, setCompBoulders] = useState<MixerBoulder[]>(boulders); // Boulder
  const [isEditBoulderPopup, setIsEditBoulderPopup] = useState(false); //Boulder
  const [isNewEditBoulderPopUp, setIsNewEditBoulderPopup] = useState(false); //Boulder
  const [tempBoulderId, setTempBoulderId] = useState(""); //Boulder
  const [tempBoulderPoints, setTempBoulderPoints] = useState<number>(); //Boulder
  const [tempBoulderColor, setTempBoulderColor] = useState<string>("");

  const handleEditBoulderPopUp = (id: string) => {
    const tempBoulder = compBoulders.find(boulder => boulder.id === id);

    if (tempBoulder) {
      setTempBoulderId(tempBoulder.id);
      setTempBoulderPoints(tempBoulder.points);
      setTempBoulderColor(tempBoulder.color);
      setIsEditBoulderPopup(true);
    } else {
      console.error(`Boulder with ID ${id} not found`);
    }
  }; //Boulder

  const updateBoulder = async (boulderId: string, newPoints: number, newColor: string) => {
    setCompBoulders(prevBoulders =>
      prevBoulders.map(boulder =>
        boulder.id === boulderId ? { ...boulder, points: newPoints, color: newColor } : boulder
      )
    );
    try {
      const data = {
        boulderId,
        newPoints,
        newColor,
        compId,
      };

      const response = await fetch("/api/mixer/manager/boulder/update-boulder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "response was not okay, could not updated Boulder color and/or name",
          color: "red",
        });
      } else {
        showNotification({
          message: "succesfully updated Boulder color and/or name",
          color: "green",
        });
      }
    } catch (error) {
      showNotification({
        message: "response was not okay, could not updated Boulder color and/or name",
        color: "red",
      });
    }
  }; //Boulder

  useEffect(() => {
    setCompBoulders(boulders);
  }, [boulders]);

  return (
    <div>
      {isNewEditBoulderPopUp && (
        <NewBoulderPopUp onCancel={() => setIsNewEditBoulderPopup(false)} compId={compId} />
      )}
      {isEditBoulderPopup && (
        <EditBoulderPopUp
          onCancel={() => setIsEditBoulderPopup(false)}
          boulderPoints={tempBoulderPoints as number}
          boulderId={tempBoulderId}
          boulderColor={tempBoulderColor}
          updateBoulder={updateBoulder}
        />
      )}
      <div>
        <h3 className="text-3xl mt-3">Boulders</h3>
        <div className="bg-slate-900 flex-col gap-2 flex p-3 rounded-sm w-full">
          {compBoulders.length > 0 ? (
            <div className="w-full flex-col flex gap-2">
              {compBoulders.map(boulder => (
                <button
                  key={boulder.id}
                  className={clsx(
                    " flex  rounded-sm justify-center p-2",
                    boulder.color === "red" && "bg-red-500/25 outline outline-red-500",
                    boulder.color === "blue" && "bg-blue-500/25 outline outline-blue-500",
                    boulder.color === "green" && "bg-green-400/25 outline outline-green-400",
                    boulder.color === "orange" && "bg-orange-500/25 outline outline-orange-500",
                    boulder.color === "yellow" && "bg-yellow-500/25 outline outline-yellow-500",
                    boulder.color === "pink" && "bg-pink-400/25 outline outline-pink-400",
                    boulder.color === "purple" && "bg-purple-600/25 outline outline-purple-600",
                    boulder.color === "white" && "bg-white/25 outline outline-white",
                    boulder.color === "black" && "bg-black/25 outline outline-white"
                  )}
                  onClick={() => handleEditBoulderPopUp(boulder.id)}
                >
                  <p className="text-xl t">{boulder.points}</p>
                </button>
              ))}
              <div className="flex items-center gap-1">
                <button
                  className="bg-green-400 p-1 rounded-full max-w-fit"
                  onClick={() => setIsNewEditBoulderPopup(!isNewEditBoulderPopUp)}
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
                <p className="font-medium">Add Boulder</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1">
                <button
                  className="bg-green-400 p-1 rounded-full max-w-fit"
                  onClick={() => setIsNewEditBoulderPopup(true)}
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
                <p className="font-medium">Add Boulder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
