'use client';
import { useState } from 'react';
import { getGradeRange } from '@/lib/routes';

export default function CompleteMenu({ route, userId, isComplete }) {
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const handleSubmit = () => {};
  const [selectedOption, setSelectedOption] = useState('');
  const gradeOptions = getGradeRange(route.grade);
  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 items-center"
      >
        {!isComplete ? (
          <label className="flex gap-3 font-bold">
            Grade:
            <select
              value={selectedOption}
              onChange={handleSelectChange}
              className="w-12 rounded bg-bg2"
            >
              {gradeOptions.map((grade, idx) => (
                <option key={idx} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-center">
            You are completed this route once, add another send!
          </p>
        )}

        <label className="flex gap-3 font-bold">
          Sends:
          <select
            value={selectedOption}
            onChange={handleSelectChange}
            className="w-8 rounded bg-bg2"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">3</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </label>
        <button type="submit" className="bg-green-500 p-1 rounded m-3">
          Submit
        </button>
      </form>
    </div>
  );
}
