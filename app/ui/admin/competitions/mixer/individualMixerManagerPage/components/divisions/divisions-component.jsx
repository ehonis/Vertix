"use client";

import EditDivisionPopUp from "./mixer-edit-division-popup";
import { useEffect, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function DivisionsComponent({ divisions, compId }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [compDivisions, setCompDivisions] = useState(divisions); //division
  const [isDivisionPopup, setIsDivisionPopup] = useState(false); //division
  const [tempDivisionText, setTempDivisionText] = useState(""); //division
  const [tempDivisionId, setTempDivisionId] = useState(""); //division
  const [popupType, setPopupType] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [checkedDivisions, setCheckedDivisions] = useState([]);

  const handleEditDivisionPopup = id => {
    const tempDivision = compDivisions.find(division => division.id === id);

    if (tempDivision) {
      setPopupType("EDIT");
      setTempDivisionId(tempDivision.id);
      setTempDivisionText(tempDivision.name);
      setIsDivisionPopup(true);
    } else {
      console.error(`Division with ID ${id} not found`);
    }
  }; //division

  const handleNewDivisionPopUp = () => {
    setPopupType("NEW");
    setTempDivisionId("");
    setTempDivisionText("");
    setIsDivisionPopup(true);
  };

  const handleDivisionCheck = (event, id) => {
    if (event.target.checked) {
      // add the id if not already there
      setCheckedDivisions(prev => [...prev, id]);
    } else {
      // remove the id if it's unchecked
      setCheckedDivisions(prev => prev.filter(divId => divId !== id));
    }
  };
  const handleDivisionDelete = async () => {
    if (checkedDivisions.length === 0) {
      showNotification({ message: "You cannot delete nothing", color: "red" });
    } else {
      const data = { divisionsToDelete: checkedDivisions };
      console.log(data);
      try {
        const response = await fetch("/api/mixer/manager/division/deleteDivision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          showNotification({ message: responseData.message, color: "red" });
        } else {
          showNotification({
            message: "Successfully removed division(s)",
            color: "green",
          });
          setIsEdit(false);
          router.refresh();
        }
      } catch (error) {
        showNotification({ message: error, color: "red" });
      }
    }
  };
  useEffect(() => {
    setCompDivisions(divisions);
  }, [divisions]);
  return (
    <div className="">
      {isDivisionPopup && (
        <EditDivisionPopUp
          onCancel={() => setIsDivisionPopup(false)}
          divisionText={tempDivisionText}
          divisionId={tempDivisionId}
          type={popupType}
          compId={compId}
        />
      )}
      <div className="mt-5">
        <div className="flex justify-between items-center">
          <h3 className="text-3xl">Divisions</h3>
          {compDivisions.length !== 0 && (
            <div className="font-normal">
              <button
                className={clsx(
                  " px-2 py-[2px] rounded-md mr-1",
                  !isEdit ? "bg-gray-400/35 outline outline-gray-400 outline-1 " : "bg-gray-400"
                )}
                onClick={() => setIsEdit(!isEdit)}
              >
                {!isEdit ? "Select" : "Cancel"}
              </button>
              {isEdit && (
                <button
                  className="bg-red-500 text-white px-2 py-[2px] rounded-md mr-1 font-semibold"
                  onClick={handleDivisionDelete}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
        <div className="bg-bg2 flex-col gap-2 flex p-3 rounded-sm w-full">
          {compDivisions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {compDivisions.map(division => (
                <div className="flex" key={division.id}>
                  {isEdit && (
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={event => handleDivisionCheck(event, division.id)}
                      // if division id is in checkedDivisions, mark the checkbox as checked
                      checked={checkedDivisions.includes(division.id)}
                    />
                  )}
                  <button
                    key={division.id}
                    className="bg-slate-900 w-full gap-3 rounded-sm flex p-2 justify-center items-center"
                    onClick={() => handleEditDivisionPopup(division.id)}
                  >
                    <p className="text-white font-barlow font-semibold text-xl">{division.name}</p>
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <button
                  className="bg-green-400 p-1 rounded-full max-w-fit"
                  onClick={handleNewDivisionPopUp}
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
                <p className="font-medium font-barlow">Add Division</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                className="bg-green-400 p-1 rounded-full max-w-fit"
                onClick={handleNewDivisionPopUp}
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
              <p className="font-medium font-barlow">Add Division</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
