"use client";
import { useState } from "react";
import clsx from "clsx";
import ErrorPopUp from "./error-pop-up";
import OnOffSwitch from "../../general/on-off-switch";
import InformationalPopUp from "../../general/informational-pop-up";
import { AnimatePresence } from "framer-motion";
import { CompetitionStatus } from "@prisma/client";
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
}: {
  id: string;
  onCommit: (data: compData) => void;
  onUncommit: (id: string) => void;
}) {
  const [commitText, setCommitText] = useState("Commit");

  const [name, SetName] = useState("");
  const [compType, setCompType] = useState("Mixer");
  const [selectedDate, setSelectedDate] = useState("");

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInformationalPopUp, setIsInformationalPopUp] = useState(false);

  const handleCommit = () => {
    const today = new Date();
    const selected = new Date(selectedDate);

    // Remove time component for accurate comparison
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    if (commitText === "Commit") {
      if (!name) {
        setErrorMessage("Name is empty for Competition");
        setIsError(true);
      } else if (!selectedDate) {
        setErrorMessage("Date is empty for Competition");
        setIsError(true);
      } else if (selected <= today) {
        setErrorMessage("Date must be beyond today's date");
        setIsError(true);
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
  const handleCancel = () => {
    setIsError(false);
  };
  const handleCompTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCompType(event.target.value);
  };
  const handleInformationalCancel = () => {
    setIsInformationalPopUp(false);
  };

  return (
    <div>
      {isError && <ErrorPopUp message={errorMessage} onCancel={handleCancel} />}
      <div className="bg-bg2 w-full rounded-lg flex flex-col p-3 gap-2">
        <h2 className="text-white font-barlow font-bold text-2xl">Competition</h2>
        <div className="w-full h-[2px] bg-white"></div>
        <div className="flex gap-2">
          <input
            type="text"
            name=""
            id=""
            value={name}
            onChange={handleNameChange}
            placeholder="Name"
            className="max-w-min bg-slate-900 text-white rounded-md px-2 py-1 focus:outline-hidden"
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
            className="max-w-min rounded-md bg-slate-900 text-white px-2 py-1"
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
            className="p-1 rounded-lg bg-slate-900 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
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
      <div className="flex gap-1 items-center justify-end mt-2">
        {commitText === "Commit" && (
          <div className="flex gap-1">
            <p className="text-white font-barlow font-bold md:text-base text-xs">
              you must commit before submitting
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="md:size-6 size-5 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        )}

        <button
          className={clsx(
            "text-white  md:p-2 p-2 md:text-base text-sm md:w-32 min-w-16 rounded-full font-barlow font-bold",
            commitText === "Committed" ? "bg-green-500" : "bg-slate-500"
          )}
          onClick={handleCommit}
        >
          {commitText}
        </button>
      </div>
    </div>
  );
}
