'use client';

import Link from 'next/link';
import RouteTile from './route-tile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/contexts/NotificationContext';

export default function FilteredRoutes({
  filter,
  ropes,
  boulders,
  user,
  completions,
}) {
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const routes = [...ropes, ...boulders];

  useEffect(() => {
    const { boulderFilter, ropeFilter, colorFilter, sectionFilter } = filter;

    const newFilteredRoutes = routes.filter((route) => {
      // Check if the route matches any color filter
      const matchesColor =
        colorFilter.length === 0 || colorFilter.includes(route.color);

      // Check if the route matches boulder grade if it's a boulder
      const matchesBoulderGrade =
        boulderFilter.length === 0 ||
        (route.type === 'boulder' && boulderFilter.includes(route.grade));

      // Check if the route matches rope grade if it's a rope
      const matchesRopeGrade =
        ropeFilter.length === 0 ||
        (route.type === 'rope' &&
          ropeFilter.some((grade) => route.grade.startsWith(grade)));

      // Check if the route matches any section filter
      const matchesSection =
        sectionFilter.length === 0 || sectionFilter.includes(route.location);

      // Return true if the route matches all active filters
      return (
        matchesColor &&
        matchesBoulderGrade &&
        matchesRopeGrade &&
        matchesSection
      );
    });

    setFilteredRoutes(newFilteredRoutes);
  }, [filter]);

  // Rest of your code remains the same
  // Dependency array includes routes and filter
  const { showNotification } = useNotification();
  const router = useRouter();

  const postRouteCompletion = async (userId, routeId, routeName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/add-route-completion`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Quick Completed ${routeName}`,
          color: 'green',
        });
      } else {
        const { error } = await response.json();
        showNotification({
          message: `Could Not Quick Complete ${routeName}: ${error}`,
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({ message: `Error: ${error.message}`, color: 'red' });
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
          body: JSON.stringify({ userId, routeId }),
        }
      );
      if (response.ok) {
        showNotification({
          message: `Uncompleted ${routeName}`,
          color: 'green',
        });
      } else {
        const { error } = await response.json();
        showNotification({
          message: `Could Not Uncomplete ${routeName}: ${error}`,
          color: 'red',
        });
      }
      router.refresh();
    } catch (error) {
      showNotification({ message: `Error: ${error.message}`, color: 'red' });
      console.error(error);
    }
  };

  const handleQuickCompletion = (routeId, routeName) => {
    postRouteCompletion(user.id, routeId, routeName);
  };

  const handleQuickUncomplete = (routeId, routeName) => {
    postRouteUnCompletion(user.id, routeId, routeName);
  };

  const completedRouteIds = user
    ? completions.map((completion) => completion.routeId)
    : [];

  return (
    <div className="flex md:flex-grow flex-col gap-5 p-5">
      <div className="bg-bg1 h-full flex-grow rounded-xl">
        <div className="p-3 flex flex-col  md:items-start items-center gap-2">
          {filteredRoutes.map((route) => (
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
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
      </div>
    </div>
  );
}
