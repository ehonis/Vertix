import { getRouteById, getRouteImagesById, findRating } from '@/lib/routes';
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
  findStarRating,
} from '@/lib/routes';
import StarRating from '@/app/ui/general/star-rating';

export const revalidate = 120;

export async function generateStaticParams() {
  const ids = await prisma.route
    .findMany()
    .then((routes) => routes.map((route) => ({ slug: route.id })));
  return ids;
}

function Header({ route, user, isComplete, isGraded, proposedGrade, rating }) {
  return (
    <div className="flex w-11/12 md:w-3/5 justify-between items-center mb-4">
      <Link href={'/routes'}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-10 fill-white"
          aria-label="Go back"
        >
          <path
            fillRule="evenodd"
            d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
      <h1 className="text-white text-3xl font-bold">{route.title}</h1>
      {user && (
        <FunctionButton
          route={route}
          userId={user.id}
          isComplete={isComplete}
          isGraded={isGraded}
          proposedGrade={proposedGrade}
          intialMenu={'Action Menu'}
          rating={rating}
          size={'size-12'}
        />
      )}
    </div>
  );
}

function RouteInfo({
  user,
  route,
  date,
  daysOld,
  totalSends,
  starRating,
  isComplete,
  isGraded,
  rating,
  proposedGrade,
}) {
  return (
    <>
      <div className="w-11/12 md:w-3/5 bg-bg1 rounded-xl h-max">
        <div
          className={clsx('w-full h-8 rounded-t-xl', {
            'bg-green-400': route.color === 'green',
            'bg-red-400': route.color === 'red',
            'bg-blue-400': route.color === 'blue',
            'bg-yellow-400': route.color === 'yellow',
            'bg-purple-400': route.color === 'purple',
            'bg-orange-400': route.color === 'orange',
            'bg-white': route.color === 'white',
            'bg-slate-400': route.color === 'defaultColor',
            'bg-pink-400': route.color === 'pink',
          })}
        ></div>
        <div className="p-5 flex md:gap-5 gap-3">
          {route.images?.length > 0 ? (
            <ImageSlider images={route.images} />
          ) : (
            <Image
              src={
                'https://utfs.io/f/bujx12z5cHJjc9Ak3DLO1WJXeZH487yuvrhiVgUb5MoAPlpN'
              }
              alt="Default climbing image"
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
                Current Set?{' '}
                {route.isArchive ? (
                  <span className="text-red-500">No</span>
                ) : (
                  <span className="text-green-500">Yes</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-3 justify-center bg-bg1 rounded-xl p-3 w-11/12 md:w-3/5">
        {starRating === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-white font-barlow">
              No Star Rating, Be the first one {'->'}
            </p>
            {user && (
              <FunctionButton
                route={route}
                userId={user.id}
                isComplete={isComplete}
                isGraded={isGraded}
                proposedGrade={proposedGrade}
                intialMenu={'Star Rating Menu'}
                rating={rating}
                size={'size-8'}
              />
            )}
          </div>
        ) : (
          <StarRating rating={starRating} />
        )}
      </div>
      <div className="flex mt-3 justify-between w-11/12 md:w-3/5 gap-5">
        <StatCard value={totalSends} label="Sends" />
        <StatCard value={daysOld} label="Days Old" />
      </div>
    </>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="flex w-full flex-col items-center rounded-xl bg-bg1 p-4 shadow-lg">
      <h2 className="gradient-text-blue m-0 p-0 text-8xl font-bold">{value}</h2>
      <p className="m-0 p-0 text-lg font-semibold text-white">{label}</p>
    </div>
  );
}

export default async function IndividualRoute({ params }) {
  const session = await auth();
  const user = session?.user || null;

  const routeId = params.slug;
  const route = await getRouteById(routeId);
  if (!route) return <p>Route not found.</p>;

  const images = (await getRouteImagesById(routeId)) || [];
  const starRating = await findStarRating(routeId);
  const totalSends = await findAllTotalSends(route.id);
  const date = formatDate(route.setDate);
  const daysOld = findDaysOld(route.setDate);

  const proposedGrade = user ? await findProposedGrade(user.id, routeId) : null;
  const isComplete = user ? await findIfCompleted(user.id, routeId) : false;
  const isGraded = user ? await findIfCommunityGraded(user.id, routeId) : false;
  const rating = user ? await findRating(user.id, routeId) : null;

  return (
    <div className="w-screen flex items-center justify-center flex-col mt-10">
      <Header
        route={route}
        user={user}
        isComplete={isComplete}
        isGraded={isGraded}
        rating={rating}
        proposedGrade={proposedGrade}
      />
      <RouteInfo
        route={route}
        user={user}
        date={date}
        daysOld={daysOld}
        totalSends={totalSends}
        starRating={starRating}
        isComplete={isComplete}
        isGraded={isGraded}
        proposedGrade={proposedGrade}
        rating={rating}
      />
    </div>
  );
}
