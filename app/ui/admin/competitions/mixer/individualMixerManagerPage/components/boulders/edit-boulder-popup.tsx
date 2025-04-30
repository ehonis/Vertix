"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";
import BoulderGradeSelect from "@/app/ui/admin/new_route/boulder-grade-select";

type EditRoutePopUpData = {
  onCancel: () => void;
  boulderId: string;
  boulderPoints: number;
  boulderColor: string;
  boulderGrade: string;
  updateBoulder: (boulderId: string, newPoints: number, newColor: string, newGrade: string) => void;
};

export default function EditBoulderPopUp({
  onCancel,
  boulderId,
  boulderPoints,
  boulderColor,
  boulderGrade,
  updateBoulder,
}: EditRoutePopUpData) {
  const [points, setPoints] = useState(boulderPoints);
  const [color, setColor] = useState(boulderColor);
  const [grade, setGrade] = useState(boulderGrade);

  const handleSaveChanges = () => {
    updateBoulder(boulderId, points, color, grade);
    onCancel();
  };

  return (
    <div>
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
          <h2 className="text-xl">Boulder Editor</h2>

          <input
            type="number"
            value={points}
            onChange={e => setPoints(parseInt(e.target.value))}
            className="bg-gray-700 p-2 rounded-sm w-full focus:outline-hidden"
            placeholder="Route Name"
          />
          <label htmlFor="">Color:</label>
          <select
            name=""
            id=""
            className="bg-gray-700 p-2 rounded-sm mb-2"
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
          <label htmlFor="">Grade:</label>
          <select
            name=""
            id=""
            value={grade}
            onChange={e => setGrade(e.target.value)}
            className="p-2 bg-gray-700 rounded-sm mb-2"
          >
            <option value="vb">VB</option>
            <option value="v0">v0</option>
            <option value="v1">v1</option>
            <option value="v2">v2</option>
            <option value="v3">v3</option>
            <option value="v4">v4</option>
            <option value="v5">v5</option>
            <option value="v6">v6</option>
            <option value="v7">v7</option>
            <option value="v8">v8</option>
            <option value="v9">v9</option>
            <option value="v10">v10</option>
          </select>

          <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
