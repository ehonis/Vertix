"use client";

import RopeGradeSelect from "./rope-grade-select";
import BoulderGradeSelect from "./boulder-grade-select";
import { useState } from "react";
import { RouteType } from "@/generated/prisma/browser";

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
        <select
          name="type"
          id=""
          onChange={handleTypeChange}
          className="bg-slate-900 rounded-sm text-white p-1 font-barlow font-bold text-lg"
        >
          <option value={undefined}>Type</option>
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
