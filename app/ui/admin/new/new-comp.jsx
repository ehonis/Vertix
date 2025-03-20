"use client";
import { useState } from "react";
import clsx from "clsx";
import ErrorPopUp from "./error-pop-up";
import OnOffSwitch from "../../general/on-off-switch";
import InformationalPopUp from "../../general/informational-pop-up";
import { AnimatePresence } from "framer-motion";

export default function NewComp({ id, onCommit, onUncommit }) {
  const [commitText, setCommitText] = useState("Commit");

  const [name, SetName] = useState("");
  const [compType, setCompType] = useState("Mixer");
  const [selectedDate, setSelectedDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInformationalPopUp, setIsInformationalPopUp] = useState(false);
  const [informationalPopUpText, setInformationalPopUpText] = useState("");

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
          isActive: isActive,
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

  const handleDateChange = event => {
    setSelectedDate(event.target.value);
  };

  const handleNameChange = event => {
    SetName(event.target.value);
  };
  const handleCancel = () => {
    setIsError(false);
  };
  const handleActiveSwitchChange = value => {
    setIsActive(value);
  };
  const handleCompTypeChange = event => {
    setCompType(event.target.value);
  };
  const handleInformationalCancel = () => {
    setIsInformationalPopUp(false);
  };
  const handleInfoButton = () => {
    setInformationalPopUpText(
      <div className="font-barlow font-bold text-white flex-col flex gap-2 text-sm">
        <div>
          <p>
            <span className="text-green-500 text-lg">Active:</span> This comp will show in the
            competitions page and people will be able to sign up
          </p>
        </div>
        <div>
          <p>
            <span className="text-red-500 text-lg">InActive:</span> This comp will not show in the
            competitions page and people will not be able to sign up
          </p>
        </div>
        <div className="w-full h-[2px] bg-white"></div>
        <p>
          Either Active or inactive, the comp will still show in the comp manager for extra
          detailing
        </p>
      </div>
    );
    setIsInformationalPopUp(true);
  };
  return (
    <div>
      {isInformationalPopUp && (
        <AnimatePresence>
          <InformationalPopUp
            html={informationalPopUpText}
            type={"basic"}
            onCancel={handleInformationalCancel}
          />
        </AnimatePresence>
      )}
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
            className="max-w-min bg-bg1 text-white rounded-md px-2 py-1 focus:outline-hidden"
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
            className="max-w-min rounded-md bg-bg1 text-white px-2 py-1"
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
            className="p-1 rounded-lg bg-bg1 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
          />
          <p className="text-xs text-white font-barlow font-bold">
            {"(this can be changed later)"}
          </p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="" className="text-white font-barlow font-bold text-lg">
            Is Active:
          </label>
          <OnOffSwitch value={isActive} onTypeSwitchValue={handleActiveSwitchChange} />
          <button onClick={handleInfoButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 stroke-white stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </button>
        </div>
        <div className="w-full h-[2px] bg-white"></div>
        <p className="text-white font-barlow font-bold italic text-sm">
          Divisions, Points, and other variables will be determined in the Comp Manager Page
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
