"use client";

import { useEffect, useState } from "react";

import InformationalPopUp from "@/app/ui/general/informational-pop-up";
import { clsx } from "clsx";
import Image from "next/image";
import ImagePopUp from "./image-uploader-popup";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { CompetitionStatus, StandingsType } from "@prisma/client";
import { generateCompetitionCsv } from "@/lib/mixers";

type VariableDataProps = {
  compId: string;
  name: string;
  compDay: Date | null;
  areScoresAvailable: boolean;
  status: CompetitionStatus;
  time: number;
  imageUrl: string | null;
  passcode: string | null;
  hasScoresBeenCalculated: boolean;
  standingsType: string | null;
};

export default function VariablesComponent({
  compId,
  name,
  compDay,
  areScoresAvailable,
  status,
  time,
  imageUrl,
  passcode,
  hasScoresBeenCalculated,
  standingsType,
}: VariableDataProps) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [compName, setCompName] = useState(name);
  const [selectedDate, setSelectedDate] = useState(compDay?.toISOString().split("T")[0]);
  const [isScoresAvailable, setIsScoresAvailable] = useState(areScoresAvailable);
  const [compTime, setCompTime] = useState(time);
  const [statusOption, setStatusOption] = useState(status);
  const [compPasscode, setCompPasscode] = useState(passcode);
  const [isScoresCalculated, setIsScoresCalculated] = useState(hasScoresBeenCalculated);
  const [infoPopUpHtml, setInfoPopUpHtml] = useState(<div></div>);
  const [isScoresAvailableInfoPopUp, setIsScoresAvailableInfoPopUp] = useState(false);
  const [isImagePopUp, setIsImagePopUp] = useState(false);
  const [isStatusInfoPopUp, setIsStatusInfoPopUp] = useState(false);
  const [compStandingsType, setCompStandingsType] = useState<StandingsType | null>(
    standingsType as StandingsType | null
  );

  const [isNameSave, setIsNameSave] = useState(false);
  const [isScoresAvailableSave, setIsScoresAvailableSave] = useState(false);
  const [isStatusSave, setIsStatusSave] = useState(false);
  const [isTimeAllottedSave, setIsTimeAllottedSave] = useState(false);
  const [isDaySave, setIsDaySave] = useState(false);
  const [isStandingsTypeSave, setIsStandingsTypeSave] = useState(false);

  useEffect(() => {
    setCompName(name);
    setSelectedDate(compDay?.toISOString().split("T")[0]);
    setIsScoresAvailable(areScoresAvailable);
    setStatusOption(status);
    setCompTime(time);
    setIsScoresCalculated(hasScoresBeenCalculated);
    setCompStandingsType(standingsType as StandingsType | null);
  }, [name, compDay, areScoresAvailable, status, time, hasScoresBeenCalculated, standingsType]);

  const handleScoresAvailableButtonClick = () => {
    setIsScoresAvailableInfoPopUp(true);
    setInfoPopUpHtml(
      <div className="flex flex-col gap-1">
        <p className="text-sm font-normal">
          <span className="text-green-400 font-bold underline">AreAvailable:</span> After the comp
          is finished and after the manual user{"'"}s points have entered, you can turn this setting
          to release the leaderboard to everyone. This should be done right before the announcement
          of rankings.
        </p>
        <p className="text-sm font-normal">
          <span className="text-red-500 font-bold underline">AreNotAvailable:</span> This should
          remain the toggle when scores are not calculated. No one will be able to see the
          leaderboard when this is the current setting.
        </p>
      </div>
    );
  };

  const handleInfoStatusButtonClick = () => {
    setIsStatusInfoPopUp(true);
    setInfoPopUpHtml(
      <div className="flex flex-col gap-1">
        <p className="text-sm font-normal">
          <span className="text-red-500 font-bold underline">Unavailable:</span> Only admins can see
          the comp in the comp manager. Use this setting when first setting up the comp.
        </p>
        <p className="text-sm font-normal">
          <span className="text-orange-400 font-bold underline">Upcoming:</span> Users will be able
          to see the comp in the comp page, but they can only sign up. Please have divisions ready
          before enabling this status
        </p>
        <p className="text-sm font-normal">
          <span className="text-blue-400 font-bold underline">In Progress:</span>
          This will start the comp. Users will be able to submit scores. This status will only last
          for the time allotted to the comp and switch to completed when the timer is finished.
        </p>
        <p className="text-sm font-normal">
          <span className="text-green-500 font-bold underline">Completed:</span>
          The comp has ended, but the comp is still listed on the comp page. Users will be able to
          see scores/leaderboard, but not enter any scores
        </p>
        <p className="text-sm font-normal">
          <span className="text-yellow-400 font-bold underline">Archived:</span>
          The comp has ended, comp is not listed on comp page
        </p>
      </div>
    );
  };

  const handleOnCancelClick = () => {
    setIsStatusInfoPopUp(false);
    setIsScoresAvailableInfoPopUp(false);
    setIsImagePopUp(false);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempName = e.target.value;
    setCompName(tempName);

    if (tempName !== name) {
      setIsNameSave(true);
    } else {
      setIsNameSave(false);
    }
  };
  const handleNameSubmit = async () => {
    const data = { compId, compName };
    try {
      const response = await fetch("/api/mixer/manager/variables/nameUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({ message: "Could not update name", color: "red" });
      } else {
        showNotification({
          message: "Successfully Changed Title",
          color: "green",
        });
        setIsNameSave(false);
        router.refresh();
      }
    } catch (error) {
      showNotification({ message: "Could not update name", color: "red" });
    }
  };
  const handleAreScoresAvailableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (statusOption !== "COMPLETED") {
      showNotification({
        message:
          "The comp has not been completed. Releasing scores without the comp being completed will not work",
        color: "red",
      });
    } else if (!isScoresCalculated) {
      showNotification({
        message:
          "Scores has not been calculated. Releasing scores without the comp being completed will not work",
        color: "red",
      });
    } else {
      setIsScoresAvailable(e.target.value === "true");
      if ((e.target.value === "true") !== areScoresAvailable) {
        setIsScoresAvailableSave(true);
      } else {
        setIsScoresAvailableSave(false);
      }
    }
  };
  const handleAreScoresAvailableSave = async () => {
    const data = { compId, isScoresAvailable };

    try {
      const response = await fetch("/api/mixer/manager/variables/areScoresAvailableUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "Could not update areScoresAvailable",
          color: "red",
        });
      } else {
        showNotification({
          message: "Successfully updated areScoresAvailable",
          color: "green",
        });
        setIsScoresAvailableSave(false);
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: "Could not update areScoresAvailable",
        color: "red",
      });
    }
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as
      | "INACTIVE"
      | "UPCOMING"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "DEMO"
      | "ARCHIVED";
    setStatusOption(selectedValue);

    if (e.target.value !== status) {
      setIsStatusSave(true);
    } else {
      setIsStatusSave(false);
    }
  };
  const handleStatusSave = async () => {
    const data = { compId, statusOption };

    try {
      const response = await fetch("/api/mixer/manager/variables/statusUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "Could not update status",
          color: "red",
        });
      } else {
        showNotification({
          message: "Successfully updated status",
          color: "green",
        });
        setIsStatusSave(false);
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: "Could not update status",
        color: "red",
      });
    }
  };
  const handleAlottedTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits
    const value = e.target.value;
    // Only update if it's empty or a valid number
    if (value === "" || /^\d+$/.test(value)) {
      const numericValue = Number(value);
      if (numericValue > 300) {
        setCompTime(300);
      } else {
        setCompTime(numericValue);
      }
    }
    const numericValue = Number(value);
    if (numericValue !== time) {
      setIsTimeAllottedSave(true);
    } else {
      setIsTimeAllottedSave(false);
    }
  };
  const handleTimeAllottedSave = async () => {
    const data = { compId, compTime };

    if (compTime === time) {
      showNotification({
        message: "Cannot change time to already set time",
        color: "red",
      });
    } else {
      try {
        const response = await fetch("/api/mixer/manager/variables/timeAllottedUpdate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          showNotification({
            message: "Could not update timeAllotted",
            color: "red",
          });
        } else {
          showNotification({
            message: "Successfully updated timeAllotted",
            color: "green",
          });
          setIsTimeAllottedSave(false);
          router.refresh();
        }
      } catch (error) {
        showNotification({
          message: "Could not update timeAllotted",
          color: "red",
        });
      }
    }
  };
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);

    if (e.target.value !== compDay?.toISOString().split("T")[0]) {
      setIsDaySave(true);
    } else {
      setIsDaySave(false);
    }
  };
  const handleDaySave = async () => {
    const dateObject = new Date(selectedDate ?? "");

    const data = { compId, dateObject };

    try {
      const response = await fetch("/api/mixer/manager/variables/dateUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "Could not update comp date",
          color: "red",
        });
      } else {
        showNotification({
          message: "Successfully updated comp date",
          color: "green",
        });
        setIsDaySave(false);
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: "Could not update comp date",
        color: "red",
      });
    }
  };
  const [isCompPasscodeSave, setIsCompPasscodeSave] = useState(false);
  const handleCompPasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompPasscode(e.target.value);
    if (e.target.value !== passcode) {
      setIsCompPasscodeSave(true);
    } else {
      setIsCompPasscodeSave(false);
    }
  };

  const handleCompPasscodeSave = async () => {
    const data = { compId, compPasscode };
    try {
      const response = await fetch("/api/mixer/manager/variables/passcodeUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: "Could not update comp passcode",
          color: "red",
        });
      } else {
        showNotification({
          message: "Successfully updated comp passcode",
          color: "green",
        });
        setIsCompPasscodeSave(false);
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: "Could not update comp passcode",
        color: "red",
      });
    }
  };
  const handleScoreCalculation = async () => {
    try {
      const response = await fetch("/api/mixer/manager/variables/calculate-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compId: compId }),
      });
      if (response.ok) {
        showNotification({
          message: "Scores calculated successfully",
          color: "green",
        });
        router.refresh();
      } else {
        showNotification({
          message: "Failed to calculate scores in api",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Failed to calculate scores in frontend",
        color: "red",
      });
    }
  };
  const handleScoreUnCalculation = async () => {
    try {
      const response = await fetch("/api/mixer/manager/variables/uncalculate-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compId: compId }),
      });
      if (response.ok) {
        showNotification({
          message: "Scores uncalculated successfully",
          color: "green",
        });
        router.refresh();
      } else {
        showNotification({
          message: "Failed to uncalculate scores in api",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Failed to uncalculate scores in frontend",
        color: "red",
      });
    }
  };
  const handleExportStandings = async () => {
    try {
      const response = await fetch("/api/mixer/manager/variables/export-standings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ compId: compId }),
      });
      if (response.ok) {
        showNotification({
          message: "Standings exported successfully",
          color: "green",
        });
        const data = await response.json();
        handleDownloadSpreadsheet(data.data);
      }
    } catch (error) {
      showNotification({
        message: "Failed to export standings",
        color: "red",
      });
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownloadSpreadsheet = (data: any) => {
    try {
      const csvString = generateCompetitionCsv(data.standingsbyAverage, "Average");

      // Create a Blob from the CSV string
      const blob = new Blob([csvString], {
        type: "text/csv;charset=utf-8;",
      });

      // Create a link element
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${compName}_Standings_By_Average.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
      } else {
        // Fallback for older browsers (less common now)
        alert("Your browser doesn't support direct downloads. Please copy the data.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Error generating or downloading CSV:", e);
      alert(`Failed to generate CSV: ${e.message}`);
    }
    try {
      const csvString = generateCompetitionCsv(data.standingsbyTop, "Top");

      // Create a Blob from the CSV string
      const blob = new Blob([csvString], {
        type: "text/csv;charset=utf-8;",
      });

      // Create a link element
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${compName}_Standings_By_Top.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
      } else {
        // Fallback for older browsers (less common now)
        alert("Your browser doesn't support direct downloads. Please copy the data.");
      }
    } catch (error) {
      console.error("Error generating or downloading CSV:", error);
      alert(`Failed to generate CSV: ${error}`);
    }
  };

  const handleCompStandingsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompStandingsType(e.target.value as StandingsType);
    if (e.target.value !== standingsType) {
      setIsStandingsTypeSave(true);
    } else {
      setIsStandingsTypeSave(false);
    }
  };
  const handleCompStandingsTypeSave = async () => {
    try {
      const response = await fetch("/api/mixer/manager/variables/standingsTypeUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compId: compId, standingsType: compStandingsType }),
      });
      if (response.ok) {
        showNotification({
          message: "Standings type updated",
          color: "green",
        });
        router.refresh();
      } else {
        showNotification({
          message: "Could not update standings type",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Could not update standings type",
        color: "red",
      });
    }
  };
  return (
    <div>
      {(isStatusInfoPopUp || isScoresAvailableInfoPopUp) && (
        <InformationalPopUp html={infoPopUpHtml} onCancel={handleOnCancelClick} />
      )}
      {isImagePopUp && (
        <ImagePopUp compId={compId} onCancel={handleOnCancelClick} imageUrl={imageUrl} />
      )}
      {/* name */}
      <div className="flex justify-between max-w-sm">
        <div className="w-full flex justify-between items-center">
          <input
            type="text"
            name=""
            id=""
            value={compName}
            onChange={handleNameChange}
            className=" text-3xl mb-2 bg-transparent focus:outline-hidden w-64"
          />
          {isNameSave && (
            <button
              className="bg-green-500 px-2 py-1 rounded-md -mt-2 font-normal"
              onClick={handleNameSubmit}
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 flex-col flex p-3 rounded-sm w-full">
        <div className="flex flex-col  gap-2">
          {/*Comp Image*/}
          <div className="flex justify-between gap-2 bg-gray-700 rounded-sm p-2 pr-3 items-center">
            <div className="flex flex-col">
              <label htmlFor="" className="text-xl">
                Comp Image
              </label>
              <label htmlFor="" className="text-sm text-gray-400 font-normal">
                {"(Tap the image to upload new)"}
              </label>
            </div>
            <button
              className="bg-slate-900 outline-2 rounded-full my-1 overflow-hidden size-28 flex justify-center items-center"
              onClick={() => setIsImagePopUp(true)}
            >
              {imageUrl === null ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-20 justify-self-center"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                  />
                </svg>
              ) : (
                <Image
                  src={imageUrl}
                  width={200}
                  height={200}
                  className="size-full object-cover rounded-full"
                  alt="Comp Image"
                />
              )}
            </button>
          </div>
          {/* areScoresAvailable */}
          <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
            <div className="flex items-center">
              <label htmlFor="" className="text-xl">
                Scores:
              </label>
              <button onClick={handleScoresAvailableButtonClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-3">
              <select
                name=""
                id=""
                value={String(isScoresAvailable)}
                onChange={handleAreScoresAvailableChange}
                className={clsx(
                  "px-1 py-1 rounded-md text-center",

                  isScoresAvailable === false && "bg-red-500",

                  isScoresAvailable === true && "bg-green-500"
                )}
              >
                <option value={"true"}>AreAvailable</option>
                <option value={"false"}>AreNotAvailable</option>
              </select>
              {isScoresAvailableSave && (
                <button
                  className="bg-green-500 px-2 py-1 rounded-md font-normal"
                  onClick={handleAreScoresAvailableSave}
                >
                  Save
                </button>
              )}
            </div>
          </div>
          {/* status */}
          <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
            <div className="flex items-center">
              <label htmlFor="" className="text-xl">
                Status:
              </label>
              <button onClick={handleInfoStatusButtonClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <select
                name=""
                id=""
                value={statusOption}
                onChange={handleStatusChange}
                className={clsx(
                  "px-1 py-1 rounded-md",
                  statusOption === CompetitionStatus.UPCOMING && "bg-blue-400",
                  statusOption === CompetitionStatus.INACTIVE && "bg-red-500",
                  statusOption === CompetitionStatus.IN_PROGRESS && "bg-green-500",
                  statusOption === CompetitionStatus.COMPLETED && "bg-green-500",
                  statusOption === CompetitionStatus.ARCHIVED && "bg-yellow-400",
                  statusOption === CompetitionStatus.DEMO && "bg-purple-400"
                )}
              >
                <option value={CompetitionStatus.UPCOMING}>Upcoming</option>
                <option value={CompetitionStatus.INACTIVE}>Unavailable</option>
                <option value={CompetitionStatus.IN_PROGRESS}>In Progress</option>
                <option value={CompetitionStatus.COMPLETED}>Completed</option>
                <option value={CompetitionStatus.DEMO}>Demo</option>
                <option value={CompetitionStatus.ARCHIVED}>Archived</option>
              </select>
              {isStatusSave && (
                <button
                  className="bg-green-500 px-2 py-1 rounded-md font-normal"
                  onClick={handleStatusSave}
                >
                  Save
                </button>
              )}
            </div>
          </div>
          {/* time alloted */}
          <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
            <label htmlFor="" className="text-lg">
              Time Allotted
            </label>
            <div className="flex gap-2">
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  name=""
                  inputMode="numeric"
                  value={compTime}
                  pattern="[0-9]*"
                  onChange={handleAlottedTimeChange}
                  placeholder="#"
                  className="bg-slate-900 rounded-sm p-1 w-10 text-center hide-spinners focus:outline-hidden"
                />
                <label htmlFor="">Min</label>
              </div>
              {isTimeAllottedSave && (
                <button
                  className="bg-green-500 px-2 py-1 rounded-md font-normal"
                  onClick={handleTimeAllottedSave}
                >
                  Save
                </button>
              )}
            </div>
          </div>
          {/* comp day */}
          <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
            <label htmlFor="" className="text-lg">
              Comp Day
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                id="date"
                name="date"
                value={selectedDate} // Controlled value
                onChange={handleDayChange} // Update state on change
                className="p-1 rounded-lg bg-slate-900 text-white cursor-pointer font-barlow font-bold focus:outline-hidden"
              />
              {isDaySave && (
                <button
                  className="bg-green-500 px-2 py-1 rounded-md font-normal"
                  onClick={handleDaySave}
                >
                  Save
                </button>
              )}
            </div>
          </div>
          {/* comp passcode */}
          <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
            <label htmlFor="" className="text-lg truncate">
              Passcode
            </label>
            <input
              type="text"
              name=""
              id=""
              placeholder="Enter Passcode"
              value={compPasscode || ""}
              onChange={handleCompPasscodeChange}
              className="bg-slate-900 rounded-sm p-1 w-32 text-center hide-spinners focus:outline-hidden"
            />
            {isCompPasscodeSave && (
              <button
                className="bg-green-500 px-2 py-1 rounded-md font-normal"
                onClick={handleCompPasscodeSave}
              >
                Save
              </button>
            )}
          </div>
          {isScoresAvailable && (
            <div className="flex gap-2 bg-gray-700 rounded-sm p-2 justify-between items-center">
              <label htmlFor="" className="text-lg truncate">
                Standings Type
              </label>
              <select
                name=""
                id=""
                value={(compStandingsType as string) || ""}
                onChange={handleCompStandingsTypeChange}
                className="bg-slate-900 rounded-sm p-1 w-32 text-center hide-spinners focus:outline-hidden"
              >
                <option value=""></option>
                <option value={StandingsType.averageDownwardMovement}>
                  Average Downward Movement
                </option>
                <option value={StandingsType.downMovementByTop}>Downward Movement By Top</option>
              </select>

              {isStandingsTypeSave && (
                <button
                  className="bg-green-500 px-2 py-1 rounded-md font-normal"
                  onClick={handleCompStandingsTypeSave}
                >
                  Save
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {status === CompetitionStatus.COMPLETED && (
        <div className="flex w-full py-2 px-1">
          {!isScoresCalculated ? (
            <button
              className="bg-green-500 px-2 py-1 rounded-md font-bold w-full"
              onClick={handleScoreCalculation}
            >
              Calculate Scores
            </button>
          ) : (
            <button
              className="bg-red-500 px-2 py-1 rounded-md font-bold w-full"
              onClick={handleScoreUnCalculation}
            >
              UnCalaculate Scores
            </button>
          )}
        </div>
      )}
      {isScoresCalculated && (
        <div className="flex flex-col gap-3 w-full py-3 px-2">
          <button
            className="bg-green-500 px-2 py-1 rounded-md font-bold w-full"
            onClick={handleExportStandings}
          >
            Export Standings to Spreadsheet
          </button>
        </div>
      )}
    </div>
  );
}
