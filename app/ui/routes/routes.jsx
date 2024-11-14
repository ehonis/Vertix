'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DefaultRoutes from './default-routes';
import FilteredRoutes from './filtered-routes';
import TopDown from './topdown';

export default function Routes({ ropes, boulders, user, completions }) {
  const [type, setType] = useState('boulder');
  const [filterByWall, setFilterByWall] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [filter, setFilter] = useState({});
  const [isFilterMenu, setIsFilterMenu] = useState(false);
  const [isFilterMap, setIsFilterMap] = useState(false);
  const [isFilterQaulity, setIsFilterQaulity] = useState(false);
  const [header, setHeader] = useState('Current Set');
  const [checkedColors, setCheckedColors] = useState({
    red: false,
    blue: false,
    yellow: false,
    green: false,
    purple: false,
    pink: false,
    orange: false,
    brown: false,
    white: false,
    black: false,
  });
  const [checkedBoulderGrades, setCheckedBoulderGrades] = useState({
    vb: false,
    v1: false,
    v2: false,
    v3: false,
    v4: false,
    v5: false,
    v6: false,
    v7: false,
    v8: false,
    v9: false,
    v10: false,
  });
  const [checkedRopeGrades, setCheckedRopeGrades] = useState({
    '5.B': false,
    5.7: false,
    5.8: false,
    5.9: false,
    '5.10': false,
    5.11: false,
    5.12: false,
    5.13: false,
  });

  useEffect(() => {
    const boulderFilter = [];
    const ropeFilter = [];
    const colorFilter = [];
    const sectionFilter = [];

    // Collect active color filters
    Object.entries(checkedColors).forEach(([color, isChecked]) => {
      if (isChecked) {
        colorFilter.push(color);
      }
    });

    // Collect active boulder grade filters
    Object.entries(checkedBoulderGrades).forEach(([grade, isChecked]) => {
      if (isChecked) {
        boulderFilter.push(grade);
      }
    });

    // Collect active rope grade filters
    Object.entries(checkedRopeGrades).forEach(([grade, isChecked]) => {
      if (isChecked) {
        ropeFilter.push(grade);
      }
    });

    // Add filter by wall if it's not null
    if (filterByWall) {
      sectionFilter.push(filterByWall);
    }
    if (
      boulderFilter.length === 0 &&
      ropeFilter.length === 0 &&
      colorFilter.length === 0 &&
      sectionFilter.length === 0
    ) {
      setIsFilter(false);
      setHeader('Current Set');
    } else {
      setIsFilter(true);
      setHeader('Filtered Routes');
    }
    // Update the filter state
    setFilter({ boulderFilter, ropeFilter, colorFilter, sectionFilter });
  }, [checkedColors, filterByWall, checkedBoulderGrades, checkedRopeGrades]);

  const handleRopeCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckedRopeGrades((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };
  const handleBoulderCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckedBoulderGrades((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };
  const handleColorCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckedColors((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };
  const handleTypeChange = (event) => setType(event.target.value);
  const handleData = (data) => {
    setFilterByWall(data);
  };
  const handleFilterMenu = () => {
    setIsFilterMenu(!isFilterMenu);
  };
  const handleFilterMap = () => {
    setIsFilterMap(!isFilterMap);
  };
  const handleFilterQaulity = () => {
    setIsFilterQaulity(!isFilterQaulity);
  };
  const resetFilters = () => {
    setFilter({});
    setIsFilter(false);
    setHeader('Current Set');
    setFilterByWall(null);
    setType('boulder');
    setCheckedColors({
      red: false,
      blue: false,
      yellow: false,
      green: false,
      purple: false,
      pink: false,
      orange: false,
      brown: false,
      white: false,
      black: false,
    });
    setCheckedBoulderGrades({
      vb: false,
      v1: false,
      v2: false,
      v3: false,
      v4: false,
      v5: false,
      v6: false,
      v7: false,
      v8: false,
      v9: false,
      v10: false,
    });
    setCheckedRopeGrades({
      '5.B': false,
      5.7: false,
      5.8: false,
      5.9: false,
      '5.10': false,
      5.11: false,
      5.12: false,
      5.13: false,
    });
  };

  return (
    <>
      <div className="flex md:flex-row flex-col">
        <div className="flex flex-col">
          <div
            className={clsx(
              'bg-bg1 mx-5 mt-5 rounded-xl p-3 flex h-12 w-96 items-center justify-between cursor-pointer',
              !isFilterMenu ? 'mb-3' : ''
            )}
            onClick={handleFilterMenu}
          >
            <button className="text-white flex text-xl items-center gap-2 font-bold">
              Filters
            </button>
            {!isFilterMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="size-6 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="size-6 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            )}
          </div>
          {isFilterMenu ? (
            <div className="mb-3">
              <div
                className={clsx(
                  'bg-bg1 mx-8 mt-1 rounded-xl p-3 flex flex-grow items-center justify-between cursor-pointer',
                  isFilterQaulity ? 'rounded-b-none' : ''
                )}
                onClick={handleFilterQaulity}
              >
                <button className="text-white flex text-xl items-center gap-2">
                  By Qualities
                </button>
                {!isFilterQaulity ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </svg>
                )}
              </div>
              {isFilterQaulity ? (
                <div className="flex justify-evenly">
                  <div className="ml-8 bg-bg1 px-5 pb-5 rounded-bl-xl flex-grow justify-center flex flex-col items-center">
                    <h3 className="text-white text-lg">Color</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(checkedColors).map((color) => (
                        <label key={color} className="flex items-center gap-2">
                          <div
                            className={clsx(
                              `size-3 rounded-full bg-${color}-500`,
                              color === 'black' &&
                                'bg-black outline outline-1 outline-white',
                              color === 'white' && 'bg-white',
                              color === 'brown' && 'bg-yellow-950'
                            )}
                          ></div>
                          <input
                            type="checkbox"
                            id={color}
                            checked={checkedColors[color]}
                            onChange={handleColorCheckboxChange}
                            className="form-checkbox size-4"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mr-8 bg-bg1 px-5 pb-5 rounded-br-xl flex-grow justify-center flex flex-col items-center">
                    <h3 className="text-white text-lg">Grade</h3>
                    <select
                      name="gradeType"
                      id="gradeType"
                      className="bg-bg2 rounded text-white p-1 mb-2"
                      onChange={handleTypeChange}
                    >
                      <option value="boulder">Boulders</option>
                      <option value="rope">Ropes</option>
                    </select>
                    {type === 'boulder' ? (
                      <div className="grid grid-cols-3 gap-1 grid-flow-row">
                        {Object.keys(checkedBoulderGrades).map((grade) => (
                          <label
                            key={grade}
                            className="flex items-center gap-2"
                          >
                            <span className="text-white text-sm">{grade}</span>
                            <input
                              type="checkbox"
                              id={grade}
                              checked={checkedBoulderGrades[grade]}
                              onChange={handleBoulderCheckboxChange}
                              className="form-checkbox size-4"
                            />
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1 grid-flow-row">
                        {Object.keys(checkedRopeGrades).map((grade) => (
                          <label
                            key={grade}
                            className="flex items-center gap-2"
                          >
                            <span className="text-white text-sm">{grade}</span>
                            <input
                              type="checkbox"
                              id={grade}
                              checked={checkedRopeGrades[grade]}
                              onChange={handleRopeCheckboxChange}
                              className="form-checkbox size-4"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div
                className={clsx(
                  'bg-bg1 mx-8 mt-1 rounded-xl p-3 flex flex-grow items-center justify-between cursor-pointer',
                  isFilterMap ? 'rounded-b-none' : ''
                )}
                onClick={handleFilterMap}
              >
                <button className="text-white flex text-xl items-center gap-2 ">
                  By Map
                </button>
                {!isFilterMap ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </svg>
                )}
              </div>
              {isFilterMap ? (
                <div className="px-8">
                  <div className="bg-bg1 flex items-center px-4 pb-8 rounded-b-xl justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex flex-col items-center">
                        <h3 className="text-white font-bold">Route Section</h3>
                        <p className="italic text-slate-400 text-sm">
                          Click on the section you want to filter
                        </p>
                      </div>
                      <div className="bg-bg2 flex flex-col pl-3 pr-4 py-1 rounded-xl">
                        <TopDown onData={handleData} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col h-screen py-5">
          <div className="flex justify-between px-5 pb-1">
            <h1 className="text-white font-bold text-3xl">{header}</h1>
            {header === 'Filtered Routes' ? (
              <button className="bg-red-500 p-2 rounded" onClick={resetFilters}>
                Reset Filters
              </button>
            ) : null}
          </div>
          {isFilter ? (
            <FilteredRoutes
              filter={filter}
              ropes={ropes}
              boulders={boulders}
              user={user}
              completions={completions}
            />
          ) : (
            <DefaultRoutes
              ropes={ropes}
              boulders={boulders}
              user={user}
              completions={completions}
            />
          )}
        </div>
      </div>
    </>
  );
}
