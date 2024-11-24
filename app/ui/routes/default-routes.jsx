import Link from 'next/link';
import RouteTile from './route-tile';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function DefaultRoutes({
  ropes,
  boulders,
  user,
  completions,
  totalRoutes,
}) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [currentRopePage, setCurrentRopePage] = useState(1);
  const [currentBoulderPage, setCurrentBoulderPage] = useState(1);

  const itemsPerPage = 8; // Number of items per page

  // Calculate the routes to display on the current page
  const paginateBoulder = (data) => {
    const start = (currentBoulderPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };
  const paginateRope = (data) => {
    const start = (currentRopePage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  const totalRopePages = Math.ceil(ropes.length / itemsPerPage);
  const totalBoulderPages = Math.ceil(boulders.length / itemsPerPage);

  const postRouteCompletion = async (userId, routeId, routeName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/add-route-completion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, routeId: routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Quick Completed ${routeName}`,
          color: 'green',
        });
      } else {
        showNotification({
          message: `Could Not Quick Complete ${routeName} w/ erorr : ${response.error}`,
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({ message: `error:${error}`, color: red });
      console.error(error);
    }
    router.refresh();
  };

  const postRouteUnCompletion = async (userId, routeId, routeName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/remove-route-completion`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, routeId: routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Uncompleted ${routeName}`,
          color: 'green',
        });
      } else {
        showNotification({
          message: `Could Not Uncomplete ${routeName}, w/ error: ${response.error}`,
        });
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickCompletion = async (routeId, routeName) => {
    postRouteCompletion(user.id, routeId, routeName);
  };
  const handleQuickUncomplete = async (routeId, routeName) => {
    postRouteUnCompletion(user.id, routeId, routeName);
  };
  let completedRouteIds = {};

  if (user) {
    try {
      completedRouteIds = completions.map((completion) => completion.routeId);
    } catch (error) {
      console.error('failed getting route completions. Error:', error);
    }
  }
  return (
    <div className="flex md:flex-row flex-col gap-5 p-5">
      <div className="bg-bg1 flex-grow rounded-xl">
        <div className="p-3">
          <h2 className="text-white font-bold text-3xl">All Ropes</h2>
        </div>
        <div className="p-3 flex flex-col items-center gap-2">
          {paginateRope(ropes).map((route) => (
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
                  onClick={() => handleQuickCompletion(route.id, route.title)}
                  className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300 relative"
                >
                  <span className="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Quick Complete
                  </span>
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
                  onClick={() => handleQuickUncomplete(route.id, route.title)}
                  className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300 relative"
                >
                  <span className="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Uncomplete
                  </span>
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
          ))}
        </div>
        {/* Ropes Pagination Controls */}
        <div className="flex justify-center gap-3 p-3">
          <button
            disabled={currentRopePage === 1}
            onClick={() => setCurrentRopePage(currentRopePage - 1)}
            className="text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-500 disabled:bg-gray-800"
          >
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
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span className="text-white">{`Page ${currentRopePage} of ${totalRopePages}`}</span>
          <button
            disabled={currentRopePage === totalRopePages}
            onClick={() => setCurrentRopePage(currentRopePage + 1)}
            className="text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-500 disabled:bg-gray-800"
          >
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
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="bg-bg1 flex-grow rounded-xl">
        <div className="p-3">
          <h2 className="text-white font-bold text-3xl">All Boulders</h2>
        </div>
        <div className="p-3 flex flex-col items-center gap-2">
          {paginateBoulder(boulders).map((route) => {
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
                    onClick={() => handleQuickCompletion(route.id, route.title)}
                    className="bg-slate-500 size-10 flex items-center justify-center rounded-full group hover:bg-green-400 transition-all duration-300 relative"
                  >
                    <span className="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Quick Complete
                    </span>
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
                    onClick={() => handleQuickUncomplete(route.id, route.title)}
                    className="bg-green-500 size-10 flex items-center justify-center rounded-full group hover:bg-red-400 transition-all duration-300 relative"
                  >
                    <span className="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Uncomplete
                    </span>
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

        <div className="flex justify-center gap-3 p-3">
          <button
            disabled={currentBoulderPage === 1}
            onClick={() => setCurrentBoulderPage(currentBoulderPage - 1)}
            className="text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-500 disabled:bg-gray-800"
          >
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
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span className="text-white">{`Page ${currentBoulderPage} of ${totalBoulderPages}`}</span>
          <button
            disabled={currentBoulderPage === totalBoulderPages}
            onClick={() => setCurrentBoulderPage(currentBoulderPage + 1)}
            className="text-white px-2 py-1 rounded bg-gray-700 hover:bg-gray-500 disabled:bg-gray-800"
          >
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
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
