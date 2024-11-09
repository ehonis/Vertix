'use client';

import { useState } from 'react';

import DefaultRoutes from './default-routes';
import FilteredRoutes from './filtered-routes';
import TopDown from './topdown';

export default function Routes({ ropes, boulders, user, completions }) {
  const [filter, setFilter] = useState([null]);

  const isFilterActive = Array.isArray(filter) && filter[0] !== null;
  const handleData = (data) => {
    setFilter(data);
  };

  return (
    <>
      <div className="p-5">
        <div className="bg-bg1 flex items-center p-4 rounded-xl justify-center">
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-white">Filter By Route Section!</h3>
            <div className="bg-bg2 flex flex-col pl-3 pr-4 py-1 rounded-xl">
              <TopDown onData={handleData} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <div className="flex justify-between px-5 pb-1">
          <h1 className="text-white font-bold text-3xl">Current Set</h1>
        </div>
        {isFilterActive ? (
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
    </>
  );
}
