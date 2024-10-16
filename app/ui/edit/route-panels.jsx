'use client';

import RoutePanel from './route-panel';

export default function RoutePanels({ routes }) {
  return (
    <div className="w-full ">
      <button className="rounded bg-slate-500 text-white font-bold p-2">
        Edit
      </button>
      <hr className="mt-2" />
      <div className="flex items-center  justify-between my-2">
        <div className="flex items-center w-[8.6rem]">
          <p className="w-16 text-white ">Color</p>
          <div className="w-[2px] bg-white h-12 mr-2"></div>
          <p className="text-white">Name</p>
        </div>
        <div className="flex items-center">
          <div className="w-[2px] bg-white h-12 mr-2"></div>
          <p className="w-16 text-white text-center">Grade</p>
          <div className="w-[2px] bg-white h-12 ml-2"></div>
        </div>
        <div className="flex items-center w-[6rem]">
          <div className="w-[2px] bg-white h-12 mr-2"></div>
          <p className="w-16 text-white">Set Date</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          return (
            <RoutePanel
              key={route.id}
              id={route.id}
              name={route.title}
              grade={route.grade}
              color={route.color}
              date={route.setDate}
            />
          );
        })}
      </div>
    </div>
  );
}
