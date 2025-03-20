"use client";

import { useEffect, useState } from "react";
import CompleteMenu from "./complete-menu";
import GradeMenu from "./grade-menu";
import AttemptMenu from "./attempt-menu";
import UploadPhotoMenu from "./upload-photo-menu";
import StarRatingMenu from "./star-rating-menu";
export default function FunctionButtonMenu({
  onCancel,
  route,
  userId,
  isComplete,
  isGraded,
  proposedGrade,
  rating,
  intialMenu,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [menu, setIsMenu] = useState(intialMenu);

  useEffect(() => {
    // Set isVisible to true after the component mounts to trigger the transition
    setIsVisible(true);
  }, []);

  const handleMenuChange = menuType => {
    setIsMenu(menuType);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-30 transition-opacity duration-700 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
      />
      <div
        className={`fixed z-40 bg-[#181a1c] text-white rounded-lg shadow-lg w-[20rem] p-1 transform transition-all duration-700 ease-out ${
          isVisible
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100"
            : "top-full left-1/2 -translate-x-1/2 opacity-0"
        }`}
      >
        <div className="mx-2">
          <div className="flex justify-between items-center">
            {menu != "Action Menu" ? (
              <button className="" onClick={() => handleMenuChange("Action Menu")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            ) : null}
            <p className="text-white mt-1 mb-2 font-bold">{menu}</p>
            <button onClick={onCancel} className=" bg-red-500 p-2  rounded-full size-3"></button>
          </div>
          {menu === "Action Menu" ? (
            <div className="flex flex-col items-center mb-3 gap-3">
              <div className="flex gap-3 ">
                <button
                  className="bg-bg2 flex  p-1 rounded-sm w-32 justify-between group hover:bg-white"
                  onClick={() => handleMenuChange("Complete Menu")}
                >
                  <p className="group-hover:text-black">Complete</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 group-hover:stroke-black stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
                <button
                  className="bg-bg2 flex  p-1 rounded-sm w-32 justify-between hover:bg-white group"
                  onClick={() => handleMenuChange("Attempt Menu")}
                >
                  <p className="group-hover:text-black">Attempt</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white group-hover:stroke-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-3 ">
                <button
                  className="bg-bg2 flex  p-1 rounded-sm w-32 justify-between group hover:bg-white"
                  onClick={() => handleMenuChange("Grade Menu")}
                >
                  <p className="group-hover:text-black">Grade</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-5 stroke-white group-hover:stroke-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
                <button
                  className="bg-bg2 flex p-1 rounded-sm w-32 justify-between group hover:bg-white"
                  onClick={() => handleMenuChange("Upload Photo Menu")}
                >
                  <p className="group-hover:text-black">Add Photo</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className="size-6 stroke-white group-hover:stroke-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                </button>
              </div>
              <button
                className="bg-bg2 flex p-1 rounded-sm w-32 justify-between group hover:bg-white"
                onClick={() => handleMenuChange("Star Rating Menu")}
              >
                <p className="group-hover:text-black">Rate</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  className="size-6 stroke-white group-hover:stroke-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                  />
                </svg>
              </button>
            </div>
          ) : null}
          {menu === "Complete Menu" ? (
            <CompleteMenu
              isComplete={isComplete}
              route={route}
              userId={userId}
              isGraded={isGraded}
              onCancel={onCancel}
            />
          ) : null}
          {menu === "Grade Menu" ? (
            <GradeMenu
              isComplete={isComplete}
              route={route}
              userId={userId}
              isGraded={isGraded}
              onCancel={onCancel}
              proposedGrade={proposedGrade}
            />
          ) : null}
          {menu === "Attempt Menu" ? (
            <AttemptMenu
              isComplete={isComplete}
              route={route}
              userId={userId}
              isGraded={isGraded}
              onCancel={onCancel}
              proposedGrade={proposedGrade}
            />
          ) : null}
          {menu === "Upload Photo Menu" ? (
            <UploadPhotoMenu route={route} userId={userId} onCancel={onCancel} />
          ) : null}
          {menu === "Star Rating Menu" ? (
            <StarRatingMenu route={route} userId={userId} onCancel={onCancel} rating={rating} />
          ) : null}
        </div>
      </div>
    </>
  );
}
