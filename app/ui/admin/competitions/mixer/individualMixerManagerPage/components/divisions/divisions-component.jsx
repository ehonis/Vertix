'use client';

import EditDivisionPopUp from './mixer-edit-division-popup';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function DivisionsComponent({ divisions }) {
  const [compDivisions, setCompDivisions] = useState(divisions); //division
  const [isDivisionPopup, setIsDivisionPopup] = useState(false); //division
  const [tempDivisionText, setTempDivisionText] = useState(''); //division
  const [tempDivisionId, setTempDivisionId] = useState(''); //division

  const handleDivisionPopup = (id) => {
    const tempDivision = compDivisions.find((division) => division.id === id);

    if (tempDivision) {
      setTempDivisionId(tempDivision.id);
      setTempDivisionText(tempDivision.name);
      setIsDivisionPopup(true);
    } else {
      console.error(`Division with ID ${id} not found`);
    }
  }; //division
  const updateDivision = (newDivisionName, divisionId) => {
    setCompDivisions((prevDivisions) =>
      prevDivisions.map((division) =>
        division.id === divisionId
          ? { ...division, name: newDivisionName }
          : division
      )
    );
  }; //division
  return (
    <div>
      {isDivisionPopup && (
        <EditDivisionPopUp
          onCancel={() => setIsDivisionPopup(false)}
          divisionText={tempDivisionText}
          divisionId={tempDivisionId}
          updateDivision={updateDivision}
        />
      )}
      <div>
        <h3 className="text-3xl mt-3">Divisions</h3>
        <div className="bg-bg2 flex-col gap-2 flex p-3 rounded w-full">
          {compDivisions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {compDivisions.map((division) => (
                <button
                  key={division.id}
                  className="bg-bg1 w-full gap-3 rounded flex p-2 justify-center items-center"
                  onClick={() => handleDivisionPopup(division.id)}
                >
                  <p className="text-white font-barlow font-semibold text-xl">
                    {division.name}
                  </p>
                </button>
              ))}
              <div className="flex items-center gap-1">
                <button className="bg-green-400 p-1 rounded-full max-w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-7 "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
                <p className="font-medium font-barlow">Add Division</p>
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
