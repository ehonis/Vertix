"use client";

import RopeGradeSelect from "./rope-grade-select";
import BoulderGradeSelect from "./boulder-grade-select";
import { useState } from "react";
import { RouteType } from "@prisma/client";

export default function GradeSelect({ onGradeChange }: { onGradeChange: (grade: string) => void }) {
  const [type, setType] = useState<RouteType | undefined>(undefined);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setType(event.target.value as RouteType);
  const handleGradeSelect = (selectedGrade: string) => {
    onGradeChange(selectedGrade); // Pass grade to parent
  };

  return (
    <>
      <div className="background flex h-6 items-center justify-start gap-2 border-none">
        <label className="text-lg  text-white font-barlow font-bold w-14">
          <span className="font-barlow font-bold text-red-500">*</span>Grade:
        </label>
        <select
          name="type"
          id=""
          onChange={handleTypeChange}
          className="bg-gray-700 rounded-sm text-white p-1 font-barlow font-bold"
        >
          <option value={undefined}></option>
          <option value="ROPE">Rope</option>
          <option value="BOULDER">Boulder</option>
        </select>
        {type === "BOULDER" ? (
          <BoulderGradeSelect onGradeChange={handleGradeSelect} />
        ) : type === "ROPE" ? (
          <RopeGradeSelect onGradeChange={handleGradeSelect} />
        ) : null}
      </div>
    </>
  );
}
