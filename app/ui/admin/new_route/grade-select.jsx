"use client";

import RopeGradeSelect from "./rope-grade-select";
import BoulderGradeSelect from "./boulder-grade-select";
import { useState } from "react";

export default function GradeSelect({ onGradeChange }) {
  const [type, setType] = useState();

  const handleTypeChange = event => setType(event.target.value);
  const handleGradeSelect = selectedGrade => {
    onGradeChange(selectedGrade); // Pass grade to parent
  };

  return (
    <>
      <div className="background flex h-6 items-center justify-start gap-2 border-none">
        <label className="text-lg font-bold text-white font-barlow font-bold w-14">
          <span className="font-barlow font-bold text-red-500">*</span>Grade:
        </label>
        <select
          name="type"
          id=""
          onChange={handleTypeChange}
          className="bg-[#181a1c] rounded-sm text-white p-1 font-barlow font-bold"
        >
          <option value="none"></option>
          <option value="rope">Rope</option>
          <option value="boulder">Boulder</option>
        </select>
        {type === "boulder" ? (
          <BoulderGradeSelect onGradeChange={handleGradeSelect} />
        ) : type === "rope" ? (
          <RopeGradeSelect onGradeChange={handleGradeSelect} />
        ) : null}
      </div>
    </>
  );
}
