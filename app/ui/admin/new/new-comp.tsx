"use client";
import { useState } from "react";
import clsx from "clsx";

import { CompetitionStatus } from "@/generated/prisma/browser";
import ConfirmationPopUp from "../../general/confirmation-pop-up";
import { useNotification } from "@/app/contexts/NotificationContext";
type compData = {
  id: string;
  title: string;
  compType: string;
  status: CompetitionStatus;
  selectedDate: string;
  type: string;
};
export default function NewComp({
  id,
  onCommit,
  onUncommit,
  onDelete,
}: {
  id: string;
  onCommit: (data: compData) => void;
  onUncommit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { showNotification } = useNotification();
  const [commitText, setCommitText] = useState("Commit");

  const [name, SetName] = useState("");
  const [compType, setCompType] = useState("Mixer");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleCommit = () => {
    const today = new Date();
    const selected = new Date(selectedDate);

    // Remove time component for accurate comparison
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (commitText === "Commit") {
      if (!name) {
        showNotification({
          message: "Name is empty for Competition",
          color: "red",
        });
      } else if (!selectedDate) {
        showNotification({
          message: "Date is empty for Competition",
          color: "red",
        });
      } else if (selected <= today) {
        showNotification({
          message: "Date must be beyond today's date",
          color: "red",
        });
      } else {
        onCommit({
          id: id,
          title: name,
          compType: compType,
          status: CompetitionStatus.INACTIVE,
          selectedDate: selectedDate,
          type: "comp",
        });
        setCommitText("Committed");
      }
      // Invalid inputs
    } else {
      onUncommit(id);
      setCommitText("Commit");
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    SetName(event.target.value);
  };
  const handleCompTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCompType(event.target.value);
  };
  const handleDelete = () => {
    onDelete(id);
    setIsDelete(false);
  };

  return (
    <div>
      {isDelete && (
        <ConfirmationPopUp
          message="Are you sure you want to delete this competition?"
          submessage="This action cannot be undone"
          onConfirmation={handleDelete}
          onCancel={() => setIsDelete(false)}
        />
      )}
      <p className="text-white font-barlow font-bold text-3xl">Comp</p>
      <div className="relative bg-slate-900 w-full rounded-lg flex flex-col p-3 gap-2 mb-2">
        <button
          className="absolute -top-3 -right-3 bg-red-500 text-white font-barlow font-bold p-2 rounded-full size-10 flex items-center justify-center"
          onClick={() => setIsDelete(true)}
        >
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
        <div className="flex gap-2">
          <input
            type="text"
            name=""
            id=""
            value={name}
            onChange={handleNameChange}
            placeholder="Name"
            className="max-w-min bg-gray-700 text-white rounded-md px-2 py-1 focus:outline-hidden text-lg"
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="" className="text-white font-barlow font-bold">
            Type:
          </label>
          <select
            name="type"
            id="type"
            value={compType}
            onChange={handleCompTypeChange}
            className="max-w-min rounded-md bg-gray-700 text-white px-2 py-1"
          >
            <option value="Mixer">Mixer</option>
          </select>
        </div>
        <div className="flex gap-1 items-center">
          <label htmlFor="" className="text-white font-barlow font-bold text-lg">
            Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={selectedDate} // Controlled value
            onChange={handleDateChange} // Update state on change
            className="p-1 rounded-lg bg-gray-700 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
          />
          <p className="text-xs text-white font-barlow font-bold">
            {"(this can be changed later)"}
          </p>
        </div>
        <p className="text-white font-barlow">
          Status will automatically be <span className="text-red-500 italic">inactive</span> upon
          creation
        </p>
        <div className="w-full h-[2px] bg-white"></div>
        <p className="text-white font-barlow font-bold italic text-sm">
          Divisions, Points, status and other variables will be determined in the Comp Manager Page
        </p>
      </div>
      <div className="flex gap-1 items-center justify-start">
        <button
          className={clsx(
            "text-white  md:p-2 p-2 md:text-base text-sm md:w-32 min-w-16 rounded-full font-barlow font-bold",
            commitText === "Committed" ? "bg-green-500" : "bg-slate-500"
          )}
          onClick={handleCommit}
        >
          {commitText}
        </button>
        {commitText === "Commit" && (
          <div className="flex gap-1">
            <p className="text-white font-barlow font-bold md:text-base text-xs">
              ← you must commit before submitting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
