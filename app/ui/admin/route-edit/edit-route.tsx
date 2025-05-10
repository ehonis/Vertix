"use client";
import clsx from "clsx";
import Link from "next/link";
import { formatDate, formatDateToYYYYMMDD, parseDateString } from "@/lib/dates";
import ImageSlider from "../../routes/individualRoutePage/route-image-slider";
import Image from "next/image";
import StarRating from "../../general/star-rating";
import { splitGradeModifier } from "@/lib/routes";
import { useState, useEffect } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { Route, RouteImage, Locations, RouteType } from "@prisma/client";

export default function EditRoute({
  route,
  images,
  daysOld,
  totalSends,
  starRating,
}: {
  route: Route;
  images: RouteImage[];
  daysOld: number;
  totalSends: number;
  starRating: number;
}) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [title, setTitle] = useState(route.title);

  const [type, setType] = useState(route.type);

  const [grade, setGrade] = useState(route.grade);
  const [finalGrade, setFinalGrade] = useState(route.grade);
  const [modifier, setModifier] = useState("");
  const [isModifier, setIsModifier] = useState(true);

  const [date, setDate] = useState(formatDateToYYYYMMDD(route.setDate));
  const [finalDate, setFinalDate] = useState(route.setDate);

  const [location, setLocation] = useState<Locations>(route.location);

  const [isSubmit, setIsSubmit] = useState(false);
  useEffect(() => {
    if (grade.startsWith("v")) {
      setGrade(route.grade);
    } else {
      const [grade, modifier] = splitGradeModifier(route.grade);
      setModifier(modifier);
      setGrade(grade);
    }
  }, [grade, route.grade]);

  useEffect(() => {
    if (grade === "5.B" || grade === "5.7" || grade.startsWith("v")) {
      setIsModifier(false);
    } else {
      setIsModifier(true);
    }
  }, [grade, modifier]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    setIsSubmit(true);
  };
  const handleBoulderGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    setFinalGrade(newGrade);
    setIsSubmit(true);
  };
  const handleRopeGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    setFinalGrade(`${newGrade}${modifier}`);
    setIsSubmit(true);
  };
  const handleRopeModifierChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModifier = event.target.value;
    setModifier(newModifier);
    setFinalGrade(`${grade}${newModifier}`);
    setIsSubmit(true);
  };
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    setType(newType as RouteType);
    setIsSubmit(true);
  };
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDate(newDate);
    setFinalDate(parseDateString(newDate));
    setIsSubmit(true);
  };
  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = event.target.value;
    setLocation(newLocation as Locations);
    setIsSubmit(true);
  };
  const handleSubmit = async () => {
    const data = {
      routeId: route.id,
      newTitle: title,
      newType: type,
      newGrade: finalGrade,
      newDate: finalDate,
      newLocation: location,
    };
    try {
      const response = await fetch("/api/routes/edit/updateRoute", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: `Response was not ok: error updating route`,
          color: "red",
        });
      } else {
        showNotification({
          message: `Successfully Updated ${route.title}`,
          color: "green",
        });
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: `${error}`,
        color: "red",
      });
    }
  };

  const handleArchive = async () => {
    const data = {
      routeId: route.id,
      isArchive: !route.isArchive,
    };
    try {
      const response = await fetch("/api/routes/edit/archiveRoute", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        showNotification({
          message: `Response was not ok: error updating route`,
          color: "red",
        });
      } else {
        showNotification({
          message: `Successfully ${route.isArchive ? "Unarchived" : "Archived"} ${route.title}`,
          color: "green",
        });
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const color = route.color;

  return (
    <>
      <div className="flex justify-center items-center flex-col py-7 ">
        <div className="flex justify-between items-center w-11/12 md:w-3/5 ">
          <div className="">
            <Link href={"/admin/manager/routes"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="size-8 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </Link>
          </div>
          <input
            type="text"
            defaultValue={route.title}
            className="text-white font-barlow font-bold text-center p-2 rounded-sm text-xl focus:outline-hidden"
            onChange={handleTitleChange}
          />
          <button className="flex flex-col items-center" onClick={handleArchive}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-8 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            <label htmlFor="" className="font-barlow font-bold text-white text-xs">
              {route.isArchive ? "Unarchive" : "Archive"}
            </label>
          </button>
        </div>

        <div className="w-11/12 md:w-3/5 bg-slate-900 h-max rounded-xl mt-5 justify-center">
          <div
            className={clsx(
              " w-full h-8 rounded-t-xl",
              {
                "bg-green-400": color === "green",
                "bg-red-400": color === "red",
                "bg-blue-400": color === "blue",
                "bg-yellow-400": color === "yellow",
                "bg-purple-400": color === "purple",
                "bg-orange-400": color === "orange",
                "bg-white": color === "white",
                "bg-slate-400": color === "defaultColor",
                "bg-pink-400": color === "pink",
              } // Using clsx for dynamic color
            )}
          ></div>

          <div className="flex p-5 justify-between">
            <div className="flex-col flex gap-2">
              {/* Type */}
              <div className="flex gap-2 items-center">
                <label htmlFor="" className="text-white font-barlow font-bold">
                  Type:
                </label>
                <select
                  name="type"
                  id="type"
                  className="font-barlow font-bold rounded-sm text-white bg-gray-700 p-1"
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value="ROPE">rope</option>
                  <option value="BOULDER">boulder</option>
                </select>
              </div>
              {/* Grade */}
              <div className="flex gap-2">
                <label htmlFor="" className="text-white font-barlow font-bold">
                  Grade:
                </label>
                {type === "ROPE" ? (
                  <>
                    <select
                      name="type"
                      id="type"
                      className="font-barlow font-bold rounded-sm text-white bg-gray-700 p-1"
                      value={grade}
                      onChange={handleRopeGradeChange}
                    >
                      <option value="5.B">5.B</option>
                      <option value="5.7">5.7</option>
                      <option value="5.8">5.8</option>
                      <option value="5.9">5.9</option>
                      <option value="5.10">5.10</option>
                      <option value="5.11">5.11</option>
                      <option value="5.12">5.12</option>
                      <option value="5.13">5.13</option>
                    </select>
                    {isModifier ? (
                      <select
                        name="type"
                        id="type"
                        className="font-barlow font-bold r w-10 rounded-sm text-white bg-gray-700 p-1"
                        value={modifier}
                        onChange={handleRopeModifierChange}
                      >
                        <option value=""></option>
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                    ) : null}
                  </>
                ) : (
                  <select
                    name="type"
                    id="type"
                    className="font-barlow font-bold rounded-sm text-white bg-gray-700 p-1"
                    value={grade}
                    onChange={handleBoulderGradeChange}
                  >
                    <option value="vb">VB</option>
                    <option value="v1">V1</option>
                    <option value="v2">V2</option>
                    <option value="v3">V3</option>
                    <option value="v4">V4</option>
                    <option value="v5">V5</option>
                    <option value="v6">V6</option>
                    <option value="v7">V7</option>
                    <option value="v8">V8+</option>
                  </select>
                )}
              </div>
              {/* Date */}
              <div className="flex gap-2 items-center">
                <label htmlFor="" className="font-barlow font-bold text-white">
                  setDate:{" "}
                </label>
                <input
                  type="date"
                  value={date}
                  className="font-barlow font-bold rounded-sm w-32 focus:outline-hidden text-white bg-gray-700 p-1 text-sm"
                  onChange={handleDateChange}
                />
              </div>
              {/* Location */}
              <div className="flex gap-2">
                <label htmlFor="" className="text-white font-barlow font-bold">
                  Location:
                </label>
                <select
                  name=""
                  id=""
                  className="font-barlow font-bold rounded-sm text-white bg-gray-700 p-1 text-sm"
                  value={location}
                  onChange={handleLocationChange}
                >
                  <option value={Locations.ABWallNorth}>AB North</option>
                  <option value={Locations.ABWallSouth}>AB South</option>
                  <option value={Locations.ropeNorth}>ropeNorth</option>
                  <option value={Locations.ropeNorthWest}>ropeNorthWest</option>
                  <option value={Locations.ropeNorthEast}>ropeNorthEast</option>
                  <option value={Locations.ropeSouthWest}>ropeSouthWest</option>
                  <option value={Locations.ropeSouthEast}>ropeSouthEast</option>
                  <option value={Locations.boulderNorthSlab}>boulderNorthSlab</option>
                  <option value={Locations.boulderNorthCave}>boulderNorthCave</option>
                  <option value={Locations.boulderMiddle}>boulderMiddle</option>
                  <option value={Locations.boulderSouth}>boulderSouth</option>
                </select>
              </div>

              <div className="text-white font-barlow font-bold text-sm">Id: {route.id}</div>
              <div className="text-white font-barlow font-bold">
                IsArchive: {route.isArchive ? "Yes" : "No"}
              </div>
            </div>
            {/* Images
            {images.length > 0 ? (
              <ImageSlider images={images} />
            ) : (
              <Image
                src={"https://utfs.io/f/bujx12z5cHJjc9Ak3DLO1WJXeZH487yuvrhiVgUb5MoAPlpN"}
                height={600}
                width={600}
                style={{ objectFit: "cover" }}
                className="w-24 h-28"
                alt="default route picture"
              />
            )} */}
          </div>
        </div>
        <div className="flex justify-end mt-3 w-11/12 md:w-3/5">
          {isSubmit ? (
            <button
              className="bg-green-400 rounded-sm font-barlow font-bold text-white p-2"
              onClick={handleSubmit}
            >
              Submit Changes
            </button>
          ) : null}
        </div>
        <div className="flex mt-3 justify-center bg-slate-900 rounded-xl p-3 w-11/12 md:w-3/5">
          <StarRating rating={starRating} />
        </div>
        <div className="flex mt-3 justify-between w-11/12 md:w-3/5">
          <div className="mr-3 flex w-full flex-col items-center rounded-xl bg-slate-900 p-4 shadow-lg">
            <h2 className="gradient-text-blue m-0 p-0 text-8xl font-bold">{totalSends}</h2>
            <p className="m-0 p-0 text-lg font-semibold text-white">Sends</p>
          </div>
          <div className="ml-2 flex w-full flex-col items-center rounded-xl bg-slate-900 p-4 shadow-lg">
            <h2 className="gradient-text m-0 p-0 text-8xl font-bold">{daysOld}</h2>
            <p className="m-0 p-0 text-lg font-semibold text-white">
              days <span className="text-iconbg">(old)</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
