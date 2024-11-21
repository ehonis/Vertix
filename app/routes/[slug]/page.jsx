import { getRouteById, getRouteImagesById } from '@/lib/routes';
import Image from 'next/image';
import clsx from 'clsx';
import ImageSlider from '@/app/ui/routes/individualRoutePage/route-image-slider';
import FunctionButton from '@/app/ui/routes/individualRoutePage/function-button';
import { findIfCompleted } from '@/lib/routeCompletions';
import { formatDate, findDaysOld } from '@/lib/dates';
import { auth } from '@/auth';
import Link from 'next/link';
import prisma from '@/prisma';
import {
  findAllTotalSends,
  findProposedGrade,
  findIfCommunityGraded,
} from '@/lib/routes';
import StarRating from '@/app/ui/general/star-rating';

export const revalidate = 120;

export function generateStaticParams() {
  const ids = prisma.route.findMany().then((routes) => {
    return routes.map((route) => ({ slug: route.id }));
  });
  return ids;
}

export default async function IndividualRoute({ params }) {
  const session = await auth();
  const routeId = params.slug;
  const user = session?.user || null;
  const images = await getRouteImagesById(routeId);
  const route = await getRouteById(routeId);
  const color = route.color;
  const date = formatDate(route.setDate);
  const daysOld = findDaysOld(route.setDate);
  const totalSends = await findAllTotalSends(route.id);

  if (user) {
    const proposedGrade = await findProposedGrade(user.id, routeId);
    const isComplete = await findIfCompleted(user.id, routeId);
    const isGraded = await findIfCommunityGraded(user.id, routeId);
    return (
      <div className="w-screen flex items-center justify-center flex-col mt-10">
        <div className="flex w-11/12 md:w-3/5 justify-between items-center mb-4">
          <Link href={'/routes'}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-10 fill-white"
            >
              <path
                fillRule="evenodd"
                d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <h1 className="text-white text-3xl font-bold">{route.title}</h1>
          <FunctionButton
            route={route}
            userId={user.id}
            isComplete={isComplete}
            isGraded={isGraded}
            proposedGrade={proposedGrade}
          />
        </div>
        <div className="w-11/12 md:w-3/5 bg-bg1 rounded-xl h-max">
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
          <div className="p-5 flex md:gap-5 gap-3">
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
              />
            )}

            <div className="h-40 bg-white w-px"></div>
            <div className="flex flex-col w-full gap-1">
              <h2 className="text-white italic text-2xl">
                {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
              </h2>
              <div className="w-full bg-white h-px"></div>
              <div>
                <p className="text-white md:text-base text-sm">
                  Grade: {route.grade}
                </p>
                <p className="text-white md:text-base text-sm">
                  Community Grade: {route.communityGrade}
                </p>
                <p className="text-white md:text-base text-sm">
                  Set Date: {date}
                </p>
                <p className="text-white md:text-base text-sm">
                  Current Set?:{' '}
                  {!route.isArchive ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </p>
              </div>
            </div>
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
  } else {
    return (
      <div className="w-screen flex items-center justify-center flex-col mt-10">
        <div className="flex w-11/12 md:w-3/5  justify-between items-center mb-4">
          <Link href={'/routes'}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-12 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
              />
            </svg>
          </Link>
          <h1 className="text-white text-3xl font-bold">{route.title}</h1>
          <div className="flex items-center">
            <Link
              className=" justify-center rounded-full items-center flex"
              href={'/signin'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-12 stroke-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="w-11/12 md:w-3/5 bg-bg1 rounded-xl h-max">
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
          <div className="p-5 flex md:gap-5 gap-3">
            {images.length > 0 ? (
              <ImageSlider images={images} />
            ) : (
              <Image
                src={'/img/Mountain Image.jpeg'}
                height={600}
                width={600}
                style={{ objectFit: 'cover' }}
                className="w-32 h-40"
              />
            )}

            <div className="h-40 bg-white w-px"></div>
            <div className="flex flex-col w-full gap-1">
              <h2 className="text-white italic text-2xl">
                {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
              </h2>
              <div className="w-full bg-white h-px"></div>
              <div>
                <p className="text-white md:text-base text-sm">
                  Grade: {route.grade}
                </p>
                <p className="text-white md:text-base text-sm">
                  Community Grade: {route.communityGrade}
                </p>
                <p className="text-white md:text-base text-sm">
                  Set Date: {date}
                </p>
                <p className="text-white md:text-base text-sm">
                  Current Set?:{' '}
                  {!route.isArchive ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </p>
              </div>
            </div>
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
}
