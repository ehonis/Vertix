'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { formatDate, formatDateToYYYYMMDD, parseDateString } from '@/lib/dates';
import ImageSlider from '../../routes/individualRoutePage/route-image-slider';
import Image from 'next/image';
import StarRating from '../../general/star-rating';
import { splitGradeModifier } from '@/lib/routes';
import { useState, useEffect } from 'react';
import { useNotification } from '@/app/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

export default function EditRoute({ route, images, daysOld, totalSends }) {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [title, setTitle] = useState(route.title);

  const [type, setType] = useState(route.type);

  const [grade, setGrade] = useState(route.grade);
  const [finalGrade, setFinalGrade] = useState(route.grade);
  const [modifier, setModifier] = useState('');
  const [isModifier, setIsModifier] = useState(true);

  const [date, setDate] = useState(formatDateToYYYYMMDD(route.setDate));
  const [finalDate, setFinalDate] = useState(route.setDate);

  const [location, setLocation] = useState(route.location);

  const [isSubmit, setIsSubmit] = useState(false);
  useEffect(() => {
    if (grade.startsWith('v')) {
      setGrade(route.grade);
    } else {
      const [grade, modifier] = splitGradeModifier(route.grade);
      setModifier(modifier);
      setGrade(grade);
    }
  }, []);

  useEffect(() => {
    if (grade === '5.B' || grade === '5.7' || grade.startsWith('v')) {
      setIsModifier(false);
    } else {
      setIsModifier(true);
    }
  }, [grade, modifier]);
  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    setIsSubmit(true);
  };
  const handleBoulderGradeChange = (event) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    setFinalGrade(newGrade);
    setIsSubmit(true);
  };
  const handleRopeGradeChange = (event) => {
    const newGrade = event.target.value;
    setGrade(newGrade);
    setFinalGrade(`${newGrade}${modifier}`);
    setIsSubmit(true);
  };
  const handleRopeModifierChange = (event) => {
    const newModifier = event.target.value;
    setModifier(newModifier);
    setFinalGrade(`${grade}${newModifier}`);
    setIsSubmit(true);
  };
  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setType(newType);
    setIsSubmit(true);
  };
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDate(newDate);
    setFinalDate(parseDateString(newDate));
    setIsSubmit(true);
  };
  const handleLocationChange = (event) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
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
      const response = await fetch('/api/edit/updateRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error(response.message);
      } else {
        showNotification({
          message: `Successfully Updated ${route.title}`,
          color: 'green',
        });
        router.refresh();
      }
    } catch (error) {
      showNotification({
        message: `${error}`,
        color: 'red',
      });
    }
  };
  const color = route.color;

  return (
    <>
      <div className="font-barlow text-white text-4xl items-center justify-center flex mt-5">
        Edit
      </div>
      <div className="flex justify-center items-center flex-col py-7 ">
        <div className="flex justify-between items-center w-11/12 md:w-3/5 ">
          <div className="">
            <Link href={'/edit'}>
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
            className="text-black font-barlow text-center p-2 rounded text-xl"
            onChange={handleTitleChange}
          />
          <button className="flex flex-col items-center">
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
            <label htmlFor="" className="font-barlow text-white text-xs">
              {route.isArchive ? 'Unarchive' : 'Archive'}
            </label>
          </button>
        </div>

        <div className="w-11/12 md:w-3/5 bg-bg1 h-max rounded-xl mt-5 justify-center">
          <div
            className={clsx(
              ' w-full h-8 rounded-t-xl',
              {
                'bg-green-400': color === 'green',
                'bg-red-400': color === 'red',
                'bg-blue-400': color === 'blue',
                'bg-yellow-400': color === 'yellow',
                'bg-purple-400': color === 'purple',
                'bg-orange-400': color === 'orange',
                'bg-white': color === 'white',
                'bg-slate-400': color === 'defaultColor',
                'bg-pink-400': color === 'pink',
              } // Using clsx for dynamic color
            )}
          ></div>

          <div className="flex p-5 justify-between">
            <div className="flex-col flex gap-2">
              {/* Type */}
              <div className="flex gap-2">
                <label htmlFor="" className="text-white font-barlow">
                  Type:
                </label>
                <select
                  name="type"
                  id="type"
                  className="font-barlow rounded"
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value="rope">rope</option>
                  <option value="boulder">boulder</option>
                </select>
              </div>
              {/* Grade */}
              <div className="flex gap-2">
                <label htmlFor="" className="text-white font-barlow">
                  Grade:
                </label>
                {type === 'rope' ? (
                  <>
                    <select
                      name="type"
                      id="type"
                      className="font-barlow rounded"
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
                        className="font-barlow rounded w-10"
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
                    className="font-barlow rounded"
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
              <div className="flex gap-2">
                <label htmlFor="" className="font-barlow text-white">
                  setDate:{' '}
                </label>
                <input
                  type="date"
                  value={date}
                  className="font-barlow rounded w-32"
                  onChange={handleDateChange}
                />
              </div>
              {/* Location */}
              <div className="flex gap-2">
                <label htmlFor="" className="text-white font-barlow">
                  Location:
                </label>
                <select
                  name=""
                  id=""
                  className="font-barlow rounded"
                  value={location}
                  onChange={handleLocationChange}
                >
                  <option value="AB">AB</option>
                  <option value="main2">ropeNorth</option>
                  <option value="main1">ropeSouth</option>
                  <option value="boulder1">boulderNorth</option>
                  <option value="boulder2">boulderSouth</option>
                </select>
              </div>
              <div className="text-white font-barlow">Id: {route.id}</div>
              <div className="text-white font-barlow">
                IsArchive: {route.isArchive ? 'Yes' : 'No'}
              </div>
            </div>
            {/* Images */}
            {images.length > 0 ? (
              <ImageSlider images={images} />
            ) : (
              <Image
                src={
                  'https://utfs.io/f/bujx12z5cHJjc9Ak3DLO1WJXeZH487yuvrhiVgUb5MoAPlpN'
                }
                height={600}
                width={600}
                style={{ objectFit: 'cover' }}
                className="w-32 h-40"
                alt="default route picture"
              />
            )}
          </div>
        </div>
        <div className="flex justify-end mt-3 w-11/12 md:w-3/5">
          {isSubmit ? (
            <button
              className="bg-green-400 rounded font-barlow text-white p-2"
              onClick={handleSubmit}
            >
              Submit Changes
            </button>
          ) : null}
        </div>
        <div className="flex mt-3 justify-center bg-bg1 rounded-xl p-3 w-11/12 md:w-3/5">
          <StarRating rating={route.starRating} />
        </div>
        <div className="flex mt-3 justify-between w-11/12 md:w-3/5">
          <div className="mr-3 flex w-full flex-col items-center rounded-xl bg-bg1 p-4 shadow-lg">
            <h2 className="gradient-text-blue m-0 p-0 text-8xl font-bold">
              {totalSends}
            </h2>
            <p className="m-0 p-0 text-lg font-semibold text-white">Sends</p>
          </div>
          <div className="ml-2 flex w-full flex-col items-center rounded-xl bg-bg1 p-4 shadow-lg">
            <h2 className="gradient-text m-0 p-0 text-8xl font-bold">
              {daysOld}
            </h2>
            <p className="m-0 p-0 text-lg font-semibold text-white">
              days <span className="text-iconbg">(old)</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
