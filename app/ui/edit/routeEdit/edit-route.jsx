'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { formatDate } from '@/lib/dates';
import ImageSlider from '../../routes/individualRoutePage/route-image-slider';
import Image from 'next/image';
import StarRating from '../../general/star-rating';

export default function editRoute({ route, images, daysOld, totalSends }) {
  const color = route.color;
  return (
    <div className="flex justify-center items-center flex-col py-14 ">
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
        <div className="text-white font-barlow font-bold text-3xl">
          {route.title}
        </div>

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
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
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
          <div className="">
            <div className="text-white"> Type: {route.type}</div>
            <div className="text-white">Grade: {route.grade}</div>
            <div className="text-white">
              SetDate: {formatDate(route.setDate)}
            </div>
            <div className="text-white">Location: {route.location}</div>
            <div className="text-white">Id: {route.id}</div>
            <div className="text-white">Score: {route.score}</div>
            <div className="text-white">
              IsArchive: {route.isArchive ? 'Yes' : 'No'}
            </div>
          </div>
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
  );
}
