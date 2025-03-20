import { useState, useEffect } from "react";
import clsx from "clsx";
import GradeSelect from "../new_route/grade-select";
import TopDown from "../../routes/topdown";
import ErrorPopUp from "./error-pop-up";

export default function NewRoute({ id, onCommit, onUncommit }) {
  const [commitText, setCommitText] = useState("Commit");
  const [isToday, setIsToday] = useState(false);

  const [name, SetName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [grade, setGrade] = useState("");
  const [color, setColor] = useState("");
  const [wall, setWall] = useState(null);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNameChange = event => {
    SetName(event.target.value);
  };
  const handleDateChange = event => {
    setSelectedDate(event.target.value);
  };
  const handleNowButton = () => {
    const date = new Date();
    // Format as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  };
  const handleColorChange = event => {
    setColor(event.target.value);
  };
  const handleWallData = data => {
    setWall(data);
  };
  const handleGradeData = data => {
    setGrade(data);
  };

  const handleCommit = () => {
    if (commitText === "Commit") {
      if (!name) {
        setErrorMessage("Name is empty for route");
        setIsError(true);
      } else if (!grade) {
        setErrorMessage(`Grade is empty, please set the grade for the ${name} route`);
        setIsError(true);
      } else if (!color) {
        setErrorMessage(`Color is empty, please put a color for the ${name} route`);
        setIsError(true);
      } else if (!selectedDate) {
        setErrorMessage(`Set Date is empty, please put a date for the ${name} route`);
        setIsError(true);
      } else if (!wall) {
        setErrorMessage(`Wall is not selected, please select a wall for the ${name} route`);
        setIsError(true);
      } else {
        onCommit({
          id: id,
          title: name,
          setDate: selectedDate,
          grade: grade,
          color: color,
          wall: wall,
          type: "route",
        });
        setCommitText("Committed");
      }
      // Invalid inputs
    } else {
      onUncommit(id);
      setCommitText("Commit");
    }
  };

  const handleCancel = () => {
    setIsError(false);
  };

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    if (selectedDate === formattedDate) {
      setIsToday(true);
    } else if (selectedDate !== formattedDate) {
      setIsToday(false);
    }
  }, [selectedDate]);

  return (
    <>
      {isError && <ErrorPopUp message={errorMessage} onCancel={handleCancel} />}
      <div className="bg-bg2 w-full rounded-lg flex md:flex-row flex-col gap-2 p-3">
        <div className="flex flex-col md:gap-4 gap-2 w-full justify-center ">
          <h2 className="text-white font-barlow font-bold text-2xl">Route</h2>
          <div className="w-full h-[2px] bg-white"></div>
          <div className="flex gap-1 items-center ">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              className="rounded-md bg-bg1 text-white py-1 px-2 max-w-min lg:h-14 lg:text-3xl font-barlow font-bold focus:outline-hidden"
            />
          </div>
          <div className="flex gap-1 items-center">
            <label htmlFor="" className="text-white font-barlow font-bold text-lg">
              <span className="font-barlow font-bold text-red-500">*</span>Set Date:
            </label>
            <button
              className={clsx(
                "font-barlow font-bold px-2 py-1 rounded-lg bg-bg1 text-white",
                isToday && "bg-green-500"
              )}
              onClick={handleNowButton}
            >
              Now
            </button>
            <input
              type="date"
              id="date"
              name="date"
              value={selectedDate} // Controlled value
              onChange={handleDateChange} // Update state on change
              className="p-1 rounded-lg bg-bg1 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
            />
          </div>
          <GradeSelect onGradeChange={handleGradeData} />
          <div className="flex gap-2 w-2/6 items-center">
            <label htmlFor="" className="text-white font-barlow font-bold text-lg">
              <span className="font-barlow font-bold text-red-500">*</span>
              Color:
            </label>

            <select
              name="color"
              id="color"
              value={color}
              onChange={handleColorChange}
              className="bg-bg1 text-white font-barlow font-bold p-1 rounded-sm"
            >
              <option value=""></option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="brown">Brown</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="pink">Pink</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </div>
        <div className="bg-bg1 pl-3 pr-4  rounded-lg flex justify-center py-3">
          <TopDown onData={handleWallData} />
        </div>
      </div>
      <div className="flex gap-1 items-center justify-end">
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
    </>
  );
}
