"use client";
import { useState } from "react";

export default function RopeGradeSelect({
  onGradeChange,
}: {
  onGradeChange: (grade: string) => void;
}) {
  const [grade, setGrade] = useState("5.7"); // Default to 5.7 or your preferred default
  const [modifier, setModifier] = useState(""); // Default to no modifier (none)

  // Handle changes for the grade (5.7, 5.8, etc.)
  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    if (
      newGrade === "5.feature" ||
      newGrade === "5.B" ||
      newGrade === "5.7" ||
      newGrade === "5.8"
    ) {
      onGradeChange(newGrade);
      setModifier("");
    } else {
      onGradeChange(`${newGrade}${modifier}`);
    }
  };

  // Handle changes for the modifier (-, +, none)
  const handleModifierChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModifier = event.target.value;
    setModifier(newModifier);
    onGradeChange(`${grade}${newModifier}`); // Combine current grade with new modifier and pass to parent
  };

  return (
    <>
      <select
        name="grade"
        id=""
        onChange={handleGradeChange}
        className="bg-slate-900 rounded-sm text-white font-barlow font-bold p-1 text-lg"
      >
        <option value="">Grade</option>
        <option value="5.feature">5.FEATURE</option>
        <option value="5.B">5.B</option>
        <option value="5.7">5.7</option>
        <option value="5.8">5.8</option>
        <option value="5.9">5.9</option>
        <option value="5.10">5.10</option>
        <option value="5.11">5.11</option>
        <option value="5.12">5.12</option>
        <option value="5.13">5.13</option>
      </select>
      {grade !== "5.feature" && grade !== "5.B" && grade !== "5.7" && (
        <select
          name="modifier"
          id=""
          onChange={handleModifierChange}
          className="bg-slate-900 rounded-sm text-white font-barlow font-bold p-1 text-lg"
        >
          <option value=""></option>
          {grade !== "5.9" && grade !== "5.8" && <option value="-">-</option>}

          <option value="+">+</option>
        </select>
      )}
    </>
  );
}
