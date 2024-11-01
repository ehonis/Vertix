'use client';

import Link from 'next/link';
import RouteTile from './routeTile';

export default function RouteTiles({ ropes, boulders, user, completions }) {
  const postRouteCompletion = async (userId, routeId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/add-route-completion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, routeId: routeId }),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickCompletion = async (routeId) => {
    postRouteCompletion(user.id, routeId);
  };

  const completedRouteIds = completions.map((completion) => completion.routeId);

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex justify-between px-5 pt-5 pb-1">
          <div>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Filter
              </span>
            </button>
          </div>
          <div className="flex gap-5">
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Search
              </span>
            </button>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                quickFilter
              </span>
            </button>
          </div>
        </div>
        <div className="flex gap-5 p-5">
          <div className="bg-bg1 w-max h-full rounded-xl">
            <div className="p-4">
              <h2 className="text-white font-bold text-3xl">Ropes</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {ropes.map((route) => {
                return (
                  <div className="flex items-center gap-2" key={route.id}>
                    <Link href={`routes/${route.id}`}>
                      <RouteTile
                        color={route.color}
                        name={route.title}
                        grade={route.grade}
                      />
                    </Link>
                    {user && !completedRouteIds.includes(route.id) ? (
                      <button
                        onClick={() => handleQuickCompletion(route.id)}
                        className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          className="size-8 stroke-white group-hover:size-9"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    ) : null}
                    {user && completedRouteIds.includes(route.id) ? (
                      <button
                        onClick={() => handleQuickCompletion(route.id)}
                        className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          className="size-8 stroke-white group-hover:size-9"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-bg1 w-max h-full rounded-xl">
            <div className="p-4">
              <h2 className="text-white font-bold text-3xl">Boulders</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {boulders.map((route) => {
                return (
                  <div className="flex items-center gap-2" key={route.id}>
                    <Link href={`routes/${route.id}`}>
                      <RouteTile
                        color={route.color}
                        name={route.title}
                        grade={route.grade}
                      />
                    </Link>
                    {user && !completedRouteIds.includes(route.id) ? (
                      <button
                        onClick={() => handleQuickCompletion(route.id)}
                        className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          className="size-8 stroke-white group-hover:size-9"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    ) : null}
                    {user && completedRouteIds.includes(route.id) ? (
                      <button
                        onClick={() => handleQuickCompletion(route.id)}
                        className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          className="size-8 stroke-white group-hover:size-9"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
