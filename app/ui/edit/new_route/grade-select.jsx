'use client';

import RopeGradeSelect from './rope-grade-select';
import BoulderGradeSelect from './boulder-grade-select';
import { useState } from 'react';

export default function GradeSelect({ onGradeChange }) {
  const [type, setType] = useState('rope');

  const handleTypeChange = (event) => setType(event.target.value);
  const handleGradeSelect = (selectedGrade) => {
    onGradeChange(selectedGrade); // Pass grade to parent
  };

  return (
    <>
      <div className="background flex h-6 items-center justify-start gap-3 border-none">
        <h3 className="text-lg font-bold text-[#181a1c] w-14">Grade:</h3>
        <select
          name="type"
          id=""
          onChange={handleTypeChange}
          className="bg-[#181a1c] rounded text-gray-400 p-1"
        >
          <option value="rope">Rope</option>
          <option value="boulder">Boulder</option>
        </select>
        {type === 'boulder' ? (
          <BoulderGradeSelect onGradeChange={handleGradeSelect} />
        ) : (
          <RopeGradeSelect onGradeChange={handleGradeSelect} />
        )}
      </div>
    </>
  );
}
