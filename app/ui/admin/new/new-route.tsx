import { useState, useEffect } from "react";
import clsx from "clsx";
import GradeSelect from "../new_route/grade-select";
import TopDown from "../../routes/topdown";
import ErrorPopUp from "./error-pop-up";
import { Locations, RouteTag } from "@prisma/client";
import ConfirmationPopUp from "../../general/confirmation-pop-up";

import { useNotification } from "@/app/contexts/NotificationContext";
type routeData = {
  id: string;
  title: string;
  setDate: string;
  grade: string;
  color: string;
  wall: Locations;
  type: string;
  tags: string[];
};

export default function NewRoute({
  id,
  onCommit,
  onUncommit,
  tags,
  onDelete,
}: {
  id: string;
  onCommit: (data: routeData) => void;
  onUncommit: (id: string) => void;
  tags: RouteTag[];
  onDelete: (id: string) => void;
}) {
  const { showNotification } = useNotification();
  const [commitText, setCommitText] = useState("Commit");
  const [isToday, setIsToday] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>(tags.map(tag => tag.name));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDelete, setIsDelete] = useState(false);
  const [name, SetName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [grade, setGrade] = useState("");
  const [color, setColor] = useState("");
  const [wall, setWall] = useState<Locations | null>(null);
  const [isNewTag, setIsNewTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    SetName(event.target.value);
  };
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  const handleNowButton = () => {
    const date = new Date();
    // Format as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  };
  const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(event.target.value);
  };
  const handleWallData = (data: Locations | null) => {
    setWall(data);
  };
  const handleGradeData = (data: string) => {
    setGrade(data);
  };

  const handleCommit = () => {
    if (commitText === "Commit") {
      if (!name) {
        showNotification({
          message: "Name is empty for route",
          color: "red",
        });
      } else if (!grade) {
        showNotification({
          message: `Grade is empty, please set the grade for the ${name} route`,
          color: "red",
        });
      } else if (!color) {
        showNotification({
          message: `Color is empty, please put a color for the ${name} route`,
          color: "red",
        });
      } else if (!selectedDate) {
        showNotification({
          message: `Set Date is empty, please put a date for the ${name} route`,
          color: "red",
        });
      } else if (!wall) {
        showNotification({
          message: `Wall is not selected, please select a wall for the ${name} route`,
          color: "red",
        });
      } else {
        onCommit({
          id: id,
          title: name,
          setDate: selectedDate,
          grade: grade,
          color: color,
          wall: wall,
          type: "route",
          tags: selectedTags,
        });
        setCommitText("Committed");
      }
      // Invalid inputs
    } else {
      onUncommit(id);
      setCommitText("Commit");
    }
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

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleNewTag = () => {
    setIsNewTag(true);
  };
  const handleNewTagCancel = () => {
    setIsNewTag(false);
    setNewTag("");
  };
  const handleNewTagSubmit = () => {
    setTempTags(prev => [...prev, newTag]);
    setSelectedTags(prev => [...prev, newTag]);
    setIsNewTag(false);
    setNewTag("");
  };
  const handleNewTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 15) {
    } else {
      setNewTag(event.target.value);
    }
  };
  const handleDelete = () => {
    onDelete(id);
    setIsDelete(false);
  };
  return (
    <>
      {isDelete && (
        <ConfirmationPopUp
          message="Are you sure you want to delete this route?"
          submessage="This action cannot be undone"
          onConfirmation={handleDelete}
          onCancel={() => setIsDelete(false)}
        />
      )}
      <div className="flex flex-col">
        <p className="text-white font-barlow font-bold text-3xl">Route</p>
        <div className="relative bg-slate-900 w-full rounded-lg flex md:flex-row flex-col gap-2 p-5 mb-2">
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
          <div className="flex flex-col md:gap-4 gap-2 w-full justify-between  ">
            <div className="flex gap-3 items-center ">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Name"
                className="rounded-md bg-gray-700 text-white py-1 px-2 max-w-min lg:h-14 lg:text-3xl font-barlow font-bold focus:outline-hidden"
              />
            </div>
            <div className="flex gap-1 items-center">
              <label htmlFor="" className="text-white font-barlow font-bold text-lg">
                <span className="font-barlow font-bold text-red-500">*</span>Set Date:
              </label>
              <button
                className={clsx(
                  "font-barlow font-bold px-2 py-1 rounded-lg bg-gray-700 text-white",
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
                className="p-1 rounded-lg bg-gray-700 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
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
                className="bg-gray-700 text-white font-barlow font-bold p-1 rounded-sm"
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
          <div className="bg-gray-700 pl-2 pr-3  rounded-lg flex justify-center py-2">
            <TopDown onData={handleWallData} />
          </div>
          {/* tags */}
          <div className="flex flex-col gap-2">
            <p className="text-white font-barlow font-bold text-lg">Tags</p>
            <div className="flex gap-2 flex-wrap items-center">
              {tempTags.map(tag => (
                <button
                  key={tag}
                  className={clsx(
                    "  px-2 py-1 rounded-full font-normal text-center text-white font-barlow",
                    selectedTags.includes(tag)
                      ? " bg-green-500 "
                      : "bg-black/25 outline-white outline"
                  )}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
              {!isNewTag && (
                <button
                  className="bg-black/25 outline-white outline p-2 size-8 rounded-full font-bold text-xl text-center text-white font-barlow flex items-center justify-center"
                  onClick={handleNewTag}
                >
                  +
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {isNewTag && (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="New Tag..."
                    value={newTag}
                    onChange={handleNewTagChange}
                    className="bg-black/25 outline-white outline px-2 py-1 rounded-full font-barlow  text-white"
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      className="p-2 rounded-full bg-red-500 text-white font-barlow font-bold"
                      onClick={handleNewTagCancel}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 stroke-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-2 rounded-full bg-green-500 text-white font-barlow font-bold"
                      onClick={handleNewTagSubmit}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 stroke-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
    </>
  );
}
