'use client';
import { useState } from 'react';

export default function RopeGradeSelect({ onGradeChange }) {
  const [grade, setGrade] = useState('5.7'); // Default to 5.7 or your preferred default
  const [modifier, setModifier] = useState(''); // Default to no modifier (none)

  // Handle changes for the grade (5.7, 5.8, etc.)
  const handleGradeChange = (event) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    onGradeChange(`${newGrade}${modifier}`); // Combine grade with current modifier and pass to parent
  };

  // Handle changes for the modifier (-, +, none)
  const handleModifierChange = (event) => {
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
        className="bg-[#181a1c] rounded text-white font-barlow font-bold p-1"
      >
        <option value=""></option>
        <option value="5.B">5.B</option>
        <option value="5.7">5.7</option>
        <option value="5.8">5.8</option>
        <option value="5.9">5.9</option>
        <option value="5.10">5.10</option>
        <option value="5.11">5.11</option>
        <option value="5.12">5.12</option>
        <option value="5.13">5.13</option>
      </select>
      <select
        name="modifier"
        id=""
        onChange={handleModifierChange}
        className="bg-[#181a1c] rounded text-white font-barlow font-bold p-1"
      >
        <option value=""></option>
        <option value="-">-</option>
        <option value="+">+</option>
      </select>
    </>
  );
}
