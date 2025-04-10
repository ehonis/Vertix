"use client";
import { useState, useEffect } from "react";
import NewRoute from "@/app/ui/admin/new/new-route";
import NewComp from "./new-comp";
import { v4 as uuidv4 } from "uuid";
import ErrorPopUp from "./error-pop-up";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Locations } from "@prisma/client";
import { CompetitionStatus } from "@prisma/client";

type compData = {
  id: string;
  title: string;
  compType: string;
  status: CompetitionStatus;
  selectedDate: string;
  type: string;
};
type routeData = {
  id: string;
  title: string;
  setDate: string;
  grade: string;
  color: string;
  wall: Locations;
  type: string;
};
export default function NewWrapper() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const options = ["Route", "Comp"];
  const [table, setTable] = useState<React.ReactNode[]>([]);
  const [data, setData] = useState<(routeData | compData)[]>([]);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewOption = (optionText: string) => {
    if (optionText === "Route") {
      const newId = uuidv4();
      setTable(prevTable => [
        ...prevTable,
        <NewRoute id={newId} key={newId} onCommit={handleCommit} onUncommit={handleUncommit} />,
      ]);
    }
    if (optionText === "Comp") {
      const newId = uuidv4();
      setTable(prevTable => [
        ...prevTable,
        <NewComp id={newId} key={newId} onCommit={handleCommit} onUncommit={handleUncommit} />,
      ]);
    }
  };

  const handleCommit = (data: routeData | compData) => {
    setData(prevData => [...prevData, data]);
  };

  const handleSubmit = async () => {
    if (data.length < table.length) {
      setErrorMessage("You have Uncommitted Entries, please revise and commit");
      setIsError(true);
    } else {
      try {
        const response = await fetch("/api/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          console.error("error");
        }
        showNotification({
          message: `Successfully added new Item(s)`,
          color: "green",
        });
        router.refresh();
      } catch (error) {
        showNotification({
          message: `${error}`,
          color: "red",
        });
      }
    }
  };
  const handleCancel = () => {
    setIsError(false);
  };
  const handleUncommit = (id: string) => {
    // Use functional update to ensure latest state is used
    setData(prevData => {
      const newData = prevData.filter(item => item.id !== id);
      return newData; // Return the updated array
    });
  };

  return (
    <>
      {isError && <ErrorPopUp message={errorMessage} onCancel={handleCancel} />}
      <div className="p-5 flex-col flex gap-3">
        <Link href={"/admin"} className="flex gap-1 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <p className="font-barlow font-bold text-xs text-white">Admin Center</p>
        </Link>
        <h1 className="text-white font-barlow font-bold text-4xl">New</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center overflow-x-auto w-[66%] rounded-r-full">
            {options.map(optionText => {
              return (
                <button
                  key={optionText}
                  className="bg-green-500 p-1 pr-2 flex font-barlow font-bold items-center text-white gap-1 rounded-full justify-between"
                  onClick={() => handleNewOption(optionText)}
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
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  {optionText}
                </button>
              );
            })}
            {/* Gradient Overlay */}
          </div>

          {table.length > 0 && (
            <button className="px-4 py-1 bg-slate-400 text-white font-barlow font-bold rounded-sm">
              Edit
            </button>
          )}
        </div>
        <div className="h-1 w-full bg-white rounded-full"></div>
        <div className="flex flex-col gap-2">
          {table.map(option => {
            return option;
          })}
        </div>

        {table.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="h-1 w-full bg-white rounded-full"></div>
            <div className="flex justify-end">
              <button
                className="p-2 bg-blue-500 text-white font-barlow font-bold rounded-sm"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
