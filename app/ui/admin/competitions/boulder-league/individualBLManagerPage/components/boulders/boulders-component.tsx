"use client";
import { useEffect, useState } from "react";
import EditBoulderPopUp from "./edit-boulder-popup";
import NewBoulderPopUp from "./new-boulder-pop-up";
import { clsx } from "clsx";
import { useNotification } from "@/app/contexts/NotificationContext";
import { BLBoulder, CompetitionStatus } from "@/generated/prisma/browser";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { useRouter } from "next/navigation";

type BouldersComponentData = {
  boulders: BLBoulder[];
  compId: string;
  compStatus: CompetitionStatus;
  isBouldersReleased: boolean;
};
export default function BoulderComponent({
  boulders,
  compId,
  compStatus,
  isBouldersReleased,
}: BouldersComponentData) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [compBoulders, setCompBoulders] = useState<BLBoulder[]>(boulders); // Boulder
  const [isEditBoulderPopup, setIsEditBoulderPopup] = useState(false); //Boulder
  const [isNewEditBoulderPopUp, setIsNewEditBoulderPopup] = useState(false); //Boulder
  const [tempBoulderId, setTempBoulderId] = useState(""); //Boulder
  const [tempBoulderPoints, setTempBoulderPoints] = useState<number>(); //Boulder
  const [tempBoulderColor, setTempBoulderColor] = useState<string>("");
  const [tempBoulderGrade, setTempBoulderGrade] = useState<string>("");
  const [tempBoulderWeek, setTempBoulderWeek] = useState<number>(1);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const deleteBoulder = async (boulderId: string) => {
    setIsEditBoulderPopup(false);
    const foundBoulder = compBoulders.find(boulder => boulder.id === boulderId);
    if (foundBoulder) {
      const response = await fetch("/api/boulder-league/manager/boulder/delete-boulder", {
        method: "POST",
        body: JSON.stringify({ boulderId }),
      });
      if (response.ok) {
        setCompBoulders(prevBoulders => prevBoulders.filter(boulder => boulder.id !== boulderId));
        showNotification({
          message: "Boulder deleted successfully",
          color: "green",
        });
        router.refresh();
      } else {
        showNotification({
          message: "Failed to delete boulder",
          color: "red",
        });
      }
      router.refresh();
    }
  };
  const handleEditBoulderPopUp = (id: string) => {
    const tempBoulder = compBoulders.find(boulder => boulder.id === id);

    if (tempBoulder) {
      setTempBoulderId(tempBoulder.id);
      setTempBoulderPoints(tempBoulder.points);
      setTempBoulderColor(tempBoulder.color);
      setTempBoulderGrade(tempBoulder.grade || "");
      setTempBoulderWeek(tempBoulder.week);
      setIsEditBoulderPopup(true);
    } else {
      console.error(`Boulder with ID ${id} not found`);
    }
  }; //Boulder

  const updateBoulder = async (
    boulderId: string,
    newPoints: number,
    newColor: string,
    newGrade: string
  ) => {
    setCompBoulders(prevBoulders =>
      prevBoulders.map(boulder =>
        boulder.id === boulderId
          ? { ...boulder, points: newPoints, color: newColor, grade: newGrade }
          : boulder
      )
    );
    try {
      const data = {
        boulderId,
        newPoints,
        newColor,
        compId,
        newGrade,
      };

      const response = await fetch("/api/boulder-league/manager/boulder/update-boulder", {
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
    if (!isShowMore) {
      const smallBoulders = boulders.slice(0, 10);
      setCompBoulders(smallBoulders);
    } else {
      setCompBoulders(boulders);
    }
  }, [boulders]);

  const handleShowMore = () => {
    if (isShowMore) {
      const smallBoulders = boulders.slice(0, 10);
      setCompBoulders(smallBoulders);
    } else {
      setCompBoulders(boulders);
    }
    setIsShowMore(!isShowMore);
  };

  const handleReleaseBoulders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/boulder-league/manager/boulder/release-boulders", {
        method: "POST",
        body: JSON.stringify({ compId, boulders: boulders }),
      });
      if (!response.ok) {
        showNotification({
          message: "response was not okay, could not release boulders",
          color: "red",
        });
      } else {
        showNotification({
          message: "boulders released successfully",
          color: "green",
        });
      }
    } catch {
      showNotification({
        message: "response was not okay, could not release boulders",
        color: "red",
      });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

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
          boulderGrade={tempBoulderGrade}
          boulderWeek={tempBoulderWeek}
          deleteBoulder={deleteBoulder}
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
                    " flex rounded-sm justify-center p-2",
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
                  <p className="text-xl">
                    W{boulder.week} {boulder.points}
                  </p>
                </button>
              ))}
              {isShowMore ? (
                <button
                  className="font-medium text-white p-2 rounded-sm bg-blue-500 mt-3"
                  onClick={handleShowMore}
                >
                  Show Less
                </button>
              ) : (
                <button
                  className="font-medium text-white p-2 rounded-sm bg-blue-500 mt-3"
                  onClick={handleShowMore}
                >
                  Show More
                </button>
              )}
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
              </div>
            </div>
          )}
        </div>
        {compStatus === CompetitionStatus.COMPLETED && !isBouldersReleased && (
          <div className="mt-2 flex justify-center w-full">
            <button
              className="bg-green-400 w-full py-1 px-5 text-sm rounded-md max-w-fit"
              onClick={handleReleaseBoulders}
            >
              Release Boulders
            </button>
          </div>
        )}
        {isBouldersReleased && (
          <div className="mt-2 flex justify-center items-centerw-full flex-col text-center">
            <p className="text-green-400">Boulders Released Already</p>
            <p className="text-red-400 italic text-xs">
              Please change the boulder location to the correct location
            </p>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center items-center">
            <ElementLoadingAnimation />
          </div>
        )}
      </div>
    </div>
  );
}
