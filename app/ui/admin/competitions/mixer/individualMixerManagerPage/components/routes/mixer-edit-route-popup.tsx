"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";
import ImageUploaderPopUp from "./image-uploader-popup";
type holdData = {
  topRopePoints: number;
  leadPoints: number;
  holdNumber: number;
};

type EditRoutePopUpData = {
  onCancel: () => void;
  routeId: string;
  routeName: string;
  routeColor: string;
  holds: holdData[];
  routeGrade: string;
  updateRouteHolds: (
    routeId: string,
    newHolds: object,
    newName: string,
    newColor: string,
    newGrade: string
  ) => void;
  routeImageUrl: string | null;
};

export default function EditRoutePopUp({
  onCancel,
  routeId,
  routeName,
  routeColor,
  holds,
  updateRouteHolds,
  routeGrade,
  routeImageUrl,
}: EditRoutePopUpData) {
  const [name, setName] = useState(routeName);
  const [tempHolds, setTempHolds] = useState([...holds]);
  const [color, setColor] = useState(routeColor);
  const [grade, setGrade] = useState(routeGrade);
  const [isImageUploaderPopup, setIsImageUploaderPopup] = useState(false);
  const handleHoldChange = (index: number, field: string, value: string) => {
    const cleanedValue = Number(String(value).replace(/^0+/, "") || "0");

    setTempHolds(prevHolds => {
      const updatedHolds = [...prevHolds];
      updatedHolds[index] = { ...updatedHolds[index], [field]: cleanedValue };
      return updatedHolds;
    });
  };

  const handleAddHold = () => {
    setTempHolds(prevHolds => [
      ...prevHolds,
      {
        holdNumber: prevHolds.length + 1, // Auto-increment hold number
        topRopePoints: 0,
        leadPoints: 0,
      },
    ]);
  };

  const handleSaveChanges = () => {
    updateRouteHolds(routeId, tempHolds, name, color, grade);
    onCancel(); // Close the popup
  };
  const handleUploadNewImage = () => {
    setIsImageUploaderPopup(true);
  };

  return (
    <div>
      {isImageUploaderPopup && (
        <ImageUploaderPopUp
          onCancel={() => {
            setIsImageUploaderPopup(false);
            onCancel();
          }}
          routeId={routeId}
          routeImageUrl={routeImageUrl}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-20"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 p-3 rounded-lg shadow-lg text-white max-w-xs w-full relative flex flex-col gap-2"
        >
          <button className="absolute top-2 right-2" onClick={onCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl">Route Editor</h2>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-gray-700 p-2 rounded-sm w-full focus:outline-hidden"
            placeholder="Route Name"
          />

          <select
            name=""
            id=""
            className="bg-gray-700 px-2 p-1 rounded"
            value={color}
            onChange={e => setColor(e.target.value)} // Corrected onChange handler
          >
            <option value="red">red</option>
            <option value="blue">blue</option>
            <option value="green">green</option>
            <option value="yellow">yellow</option>
            <option value="purple">purple</option>
            <option value="white">white</option>
            <option value="black">black</option>
            <option value="pink">pink</option>
            <option value="orange">orange</option>
          </select>

          <select
            name=""
            id=""
            className="bg-gray-700 px-2 p-1 rounded"
            value={grade}
            onChange={e => setGrade(e.target.value)}
          >
            <option value="5.B">5.B</option>
            <option value="5.7">5.7</option>
            <option value="5.8-">5.8-</option>
            <option value="5.8">5.8</option>
            <option value="5.8+">5.8+</option>
            <option value="5.9-">5.9-</option>
            <option value="5.9">5.9</option>
            <option value="5.9+">5.9+</option>
            <option value="5.10-">5.10-</option>
            <option value="5.10">5.10</option>
            <option value="5.10+">5.10+</option>
            <option value="5.11-">5.11-</option>
            <option value="5.11">5.11</option>
            <option value="5.11+">5.11+</option>
            <option value="5.12-">5.12-</option>
            <option value="5.12">5.12</option>
            <option value="5.12+">5.12+</option>
            <option value="5.13-">5.13-</option>
            <option value="5.13">5.13</option>
            <option value="5.13+">5.13+</option>
          </select>
          <div className="flex flex-col gap-5 my-2">
            <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={handleUploadNewImage}>
              Upload New Image
            </button>
            {routeImageUrl && (
              <button className="bg-purple-500 px-3 py-1 rounded-md">Preview Image</button>
            )}
          </div>
          <div>
            <div className="grid grid-cols-3 bg-gray-700 rounded-sm px-2 pr-4 mb-1">
              <p className="place-self-start">Hold #</p>
              <p className="place-self-center">TR Pts</p>
              <p className="place-self-end">Lead Pts</p>
            </div>

            {/* Holds List */}
            <div className="max-h-80 overflow-y-auto rounded-sm w-full p-1">
              {tempHolds.length > 0 ? (
                <div className="flex flex-col gap-1 w-full">
                  {tempHolds.map((hold, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "bg-gray-700 p-1 rounded-sm w-full grid grid-cols-3 gap-2 items-center",
                        index > 0 &&
                          tempHolds[index - 1]?.topRopePoints > hold.topRopePoints &&
                          "outline outline-red-500",
                        index > 0 &&
                          tempHolds[index - 1]?.leadPoints > hold.leadPoints &&
                          "outline outline-red-500"
                      )}
                    >
                      <p className="text-start">{hold.holdNumber}</p>

                      <input
                        type="number"
                        value={hold.topRopePoints}
                        onChange={e => handleHoldChange(index, "topRopePoints", e.target.value)}
                        className="bg-slate-900 p-1 rounded-sm w-3/4 text-center place-self-center focus:outline-hidden"
                      />

                      <input
                        type="number"
                        value={hold.leadPoints}
                        onChange={e => handleHoldChange(index, "leadPoints", e.target.value)}
                        className="bg-slate-900 p-1 rounded-sm w-3/4 text-center place-self-end focus:outline-hidden"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">No holds added.</p>
              )}
            </div>

            {/* Add Hold Button */}
            <div className="flex justify-between items-center mt-3">
              <button
                className="bg-green-500 px-2 py-1 rounded-md flex items-center gap-2"
                onClick={handleAddHold}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>Add Hold</span>
              </button>

              <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
