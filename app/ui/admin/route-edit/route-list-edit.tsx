"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Route } from "@prisma/client";
import Link from "next/link";
import { formatDateMMDD } from "@/lib/date";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import ConfirmationPopUp from "../../general/confirmation-pop-up";

export default function RouteListEdit({ ropes, boulders }: { ropes: Route[]; boulders: Route[] }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [selectedBoulders, setSelectedBoulders] = useState<Route[]>([]);

  const [routes, setRoutes] = useState<Route[]>(ropes);

  const [filteredBoulders, setFilteredBoulders] = useState<Route[]>(boulders);
  const [isRoutesExpanded, setIsRoutesExpanded] = useState(false);
  const [isRouteEdit, setIsRouteEdit] = useState(false);
  const [isBoulderExpanded, setIsBoulderExpanded] = useState(false);
  const [isBoulderEdit, setIsBoulderEdit] = useState(false);

  const [isDeleteConfirmationRope, setIsDeleteConfirmationRope] = useState(false);
  const [isDeleteConfirmationBoulder, setIsDeleteConfirmationBoulder] = useState(false);
  const [isArchiveConfirmationRope, setIsArchiveConfirmationRope] = useState(false);
  const [isArchiveConfirmationBoulder, setIsArchiveConfirmationBoulder] = useState(false);

  const handleRouteSelect = (route: Route) => {
    if (selectedRoutes.some(r => r.id === route.id)) {
      setSelectedRoutes(prev => prev.filter(r => r.id !== route.id));
    } else {
      setSelectedRoutes(prev => [...prev, route]);
    }
  };

  const handleBoulderSelect = (boulder: Route) => {
    if (selectedBoulders.some(b => b.id === boulder.id)) {
      setSelectedBoulders(prev => prev.filter(b => b.id !== boulder.id));
    } else {
      setSelectedBoulders(prev => [...prev, boulder]);
    }
  };

  useEffect(() => {
    console.log(selectedRoutes);
  });

  useEffect(() => {
    if (!isRoutesExpanded) {
      setRoutes(ropes.slice(0, 10));
    } else {
      setRoutes(ropes);
    }
    if (!isBoulderExpanded) {
      setFilteredBoulders(boulders.slice(0, 10));
    } else {
      setFilteredBoulders(boulders);
    }
  }, [ropes, boulders, isRoutesExpanded, isBoulderExpanded]);

  const handleShowMore = () => {
    setIsRoutesExpanded(true);
    setRoutes(ropes);
  };
  const handleShowLess = () => {
    setIsRoutesExpanded(false);
    setRoutes(ropes.slice(0, 10));
  };
  const handleRouteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setRoutes(
      ropes.filter(
        rope =>
          rope.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          rope.grade.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  };

  const handleShowMoreBoulders = () => {
    setIsBoulderExpanded(true);
    setFilteredBoulders(boulders);
  };

  const handleShowLessBoulders = () => {
    setIsBoulderExpanded(false);
    setFilteredBoulders(boulders.slice(0, 10));
  };

  const handleBoulderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setFilteredBoulders(
      boulders.filter(
        boulder =>
          boulder.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          boulder.grade.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  };

  const handleRopeDelete = async () => {
    try {
      const response = await fetch("/api/routes/edit/delete-route", {
        method: "DELETE",
        body: JSON.stringify({ routes: selectedRoutes }),
      });
      if (response.ok) {
        showNotification({ message: "Routes deleted successfully", color: "green" });
      } else {
        showNotification({ message: "Error deleting routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error deleting routes", color: "red" });
    } finally {
      setIsDeleteConfirmationRope(false);
      setIsRouteEdit(false);
      router.refresh();
    }
  };
  const handleBoulderDelete = async () => {
    try {
      const response = await fetch("/api/routes/edit/delete-route", {
        method: "DELETE",
        body: JSON.stringify({ routes: selectedBoulders }),
      });
      if (response.ok) {
        showNotification({ message: "Routes deleted successfully", color: "green" });
      } else {
        showNotification({ message: "Error deleting routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error deleting routes", color: "red" });
    } finally {
      setIsDeleteConfirmationBoulder(false);
      setIsBoulderEdit(false);
      router.refresh();
    }
  };

  const handleRopeArchive = async () => {
    try {
      const response = await fetch("/api/routes/edit/archive-route", {
        method: "PATCH",
        body: JSON.stringify({ routes: selectedRoutes }),
      });
      if (response.ok) {
        showNotification({ message: "Routes archived successfully", color: "green" });
      } else {
        showNotification({ message: "Error archiving routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error archiving routes", color: "red" });
    } finally {
      setIsArchiveConfirmationRope(false);
      router.refresh();
    }
  };
  const handleBoulderArchive = async () => {
    try {
      const response = await fetch("/api/routes/edit/archive-route", {
        method: "PATCH",
        body: JSON.stringify({ routes: selectedBoulders }),
      });
      if (response.ok) {
        showNotification({ message: "Routes archived successfully", color: "green" });
      } else {
        showNotification({ message: "Error archiving routes", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Error archiving routes", color: "red" });
    } finally {
      setIsArchiveConfirmationBoulder(false);
      router.refresh();
    }
  };

  return (
    <div className="text-white font-barlow w-sm md:w-full md:flex-row flex-col flex gap-10 ">
      {isDeleteConfirmationRope && (
        <ConfirmationPopUp
          message="Are you sure you want to delete these routes?"
          onConfirmation={handleRopeDelete}
          onCancel={() => setIsDeleteConfirmationRope(false)}
          submessage="This action cannot be undone."
        />
      )}
      {isDeleteConfirmationBoulder && (
        <ConfirmationPopUp
          message="Are you sure you want to delete these routes?"
          onConfirmation={handleBoulderDelete}
          onCancel={() => setIsDeleteConfirmationBoulder(false)}
          submessage="This action cannot be undone."
        />
      )}
      {isArchiveConfirmationRope && (
        <ConfirmationPopUp
          message="Are you sure you want to archive these routes?"
          onConfirmation={handleRopeArchive}
          onCancel={() => setIsArchiveConfirmationRope(false)}
          submessage="This action can be undone."
        />
      )}
      {isArchiveConfirmationBoulder && (
        <ConfirmationPopUp
          message="Are you sure you want to archive these routes?"
          onConfirmation={handleBoulderArchive}
          onCancel={() => setIsArchiveConfirmationBoulder(false)}
          submessage="This action can be undone."
        />
      )}
      <div className="md:w-1/2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Current Ropes</h2>
          {isRouteEdit ? (
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-gray-500 rounded-md"
                onClick={() => setIsArchiveConfirmationRope(true)}
              >
                Archive
              </button>{" "}
              <button
                className="px-2 py-1 bg-red-500 rounded-md "
                onClick={() => setIsDeleteConfirmationRope(true)}
              >
                Delete
              </button>
              <button
                className="bg-blue-500/25 outline-blue-500 outline rounded-full p-2"
                onClick={() => setIsRouteEdit(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="bg-blue-500/25 outline-blue-500 outline rounded-md px-2 py-1"
              onClick={() => setIsRouteEdit(!isRouteEdit)}
            >
              Edit
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-md">
          <div className="p-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border-b border-white w-full p-1 focus:outline-none"
              onChange={handleRouteSearch}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          {routes.map(rope => (
            <motion.div
              key={rope.id}
              className="flex items-center gap-2 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isRouteEdit && (
                <input
                  type="checkbox"
                  checked={selectedRoutes.some(r => r.id === rope.id)}
                  onChange={() => handleRouteSelect(rope)}
                  className="size-5"
                />
              )}
              <Link
                href={`/admin/manager/routes/${rope.id}`}
                className={clsx(
                  "outline rounded-md p-2 w-full flex justify-between items-center",
                  rope.color === "green" && "bg-green-500/25 outline-green-500",
                  rope.color === "blue" && "bg-blue-500/25 outline-blue-500",
                  rope.color === "red" && "bg-red-500/25 outline-red-500",
                  rope.color === "yellow" && "bg-yellow-500/25 outline-yellow-500",
                  rope.color === "purple" && "bg-purple-500/25 outline-purple-500",
                  rope.color === "orange" && "bg-orange-500/25 outline-orange-500",
                  rope.color === "pink" && "bg-pink-500/25 outline-pink-500",
                  rope.color === "gray" && "bg-gray-500/25 outline-gray-500",
                  rope.color === "white" && "bg-white/25 outline-white",
                  rope.color === "black" && "bg-black/25 outline-white/25"
                )}
              >
                <div>
                  <p className="text-base font-bold">{rope.title}</p>
                  <p className="text-xs">{rope.grade}</p>
                </div>
                <p>{formatDateMMDD(rope.setDate)}</p>
              </Link>
            </motion.div>
          ))}
          <div className="place-self-end mt-3">
            {!isRoutesExpanded ? (
              <button className="p-2 bg-blue-500 rounded-md" onClick={handleShowMore}>
                Show All
              </button>
            ) : (
              <button className="p-2 bg-blue-500 rounded-md" onClick={handleShowLess}>
                Show Less
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 md:mt-0 md:w-1/2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Current Boulders</h2>
          {isBoulderEdit ? (
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-gray-500 rounded-md"
                onClick={() => setIsArchiveConfirmationBoulder(true)}
              >
                Archive
              </button>
              <button
                className="px-2 py-1 bg-red-500 rounded-md "
                onClick={() => setIsDeleteConfirmationBoulder(true)}
              >
                Delete
              </button>
              <button
                className="bg-blue-500/25 outline-blue-500 outline rounded-full p-2"
                onClick={() => setIsBoulderEdit(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="bg-blue-500/25 outline-blue-500 outline rounded-md px-2 py-1"
              onClick={() => setIsBoulderEdit(!isBoulderEdit)}
            >
              Edit
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-md">
          <div className="p-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border-b border-white w-full p-1 focus:outline-none"
              onChange={handleBoulderSearch}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          {filteredBoulders.map(boulder => (
            <motion.div
              key={boulder.id}
              className="flex items-center gap-2 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isBoulderEdit && (
                <input
                  type="checkbox"
                  checked={selectedBoulders.some(b => b.id === boulder.id)}
                  onChange={() => handleBoulderSelect(boulder)}
                  className="size-5"
                />
              )}
              <Link
                href={`/admin/manager/routes/${boulder.id}`}
                className={clsx(
                  "outline rounded-md p-2 w-full flex justify-between items-center",
                  boulder.color === "green" && "bg-green-500/25 outline-green-500",
                  boulder.color === "blue" && "bg-blue-500/25 outline-blue-500",
                  boulder.color === "red" && "bg-red-500/25 outline-red-500",
                  boulder.color === "yellow" && "bg-yellow-500/25 outline-yellow-500",
                  boulder.color === "purple" && "bg-purple-500/25 outline-purple-500",
                  boulder.color === "orange" && "bg-orange-500/25 outline-orange-500",
                  boulder.color === "pink" && "bg-pink-500/25 outline-pink-500",
                  boulder.color === "gray" && "bg-gray-500/25 outline-gray-500",
                  boulder.color === "white" && "bg-white/25 outline-white",
                  boulder.color === "black" && "bg-black/25 outline-white/25"
                )}
              >
                <div>
                  <p className="text-base font-bold">{boulder.title}</p>
                  <p className="text-xs">{boulder.grade}</p>
                </div>
                <p>{formatDateMMDD(boulder.setDate)}</p>
              </Link>
            </motion.div>
          ))}
          <div className="place-self-end mt-3">
            {!isBoulderExpanded ? (
              <button className="p-2 bg-blue-500 rounded-md" onClick={handleShowMoreBoulders}>
                Show All
              </button>
            ) : (
              <button className="p-2 bg-blue-500 rounded-md" onClick={handleShowLessBoulders}>
                Show Less
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
