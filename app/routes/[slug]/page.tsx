import {
  getRouteById,
  getRouteImagesById,
  findRating,
  findIfCompleted,
  findAllTotalSends,
  findProposedGrade,
  findStarRating,
  findCommunityGrade,
  getBoulderGradeMapping,
} from "@/lib/route";
import { formatDate, findDaysOld, formatDateMMDDYY } from "@/lib/date";
import Image from "next/image";
import clsx from "clsx";

import { auth } from "@/auth";
import Link from "next/link";
import prisma from "@/prisma";
import StarRating from "@/app/ui/general/star-rating";
import FunctionButton from "@/app/ui/routes/individualRoutePage/function-button";
import { Route, RouteType, User } from "@prisma/client";

export const revalidate = 120;

export async function generateStaticParams() {
  const ids = await prisma.route
    .findMany()
    .then(routes => routes.map(route => ({ slug: route.id })));
  return ids;
}

function Header({
  route,
  user,
  isComplete,
  isGraded,
  proposedGrade,
  rating,
}: {
  route: Route;
  user: User | null;
  isComplete: boolean;
  isGraded: boolean;
  proposedGrade: string | null;
  rating: {
    stars: number;
    comment: string | null;
  } | null;
}) {
  return (
    <div className="flex w-11/12 md:w-3/5 justify-between items-center mb-4">
      <Link href={"/routes"}>
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
      <h1 className="text-white text-3xl font-bold text-center">{route.title}</h1>
      {user ? (
        <FunctionButton
          route={route}
          userId={user.id}
          isComplete={isComplete}
          isGraded={isGraded}
          proposedGrade={proposedGrade}
          intialMenu={"Action Menu"}
          rating={rating}
          size={"size-12"}
        />
      ) : (
        <div className="size-12"></div>
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
  communityGrade,
}: {
  user: User | null;
  route: Route;
  date: string;
  daysOld: number;
  totalSends: number | undefined;
  starRating: number | undefined;
  isComplete: boolean;
  isGraded: boolean;
  rating: {
    stars: number;
    comment: string | null;
  } | null;
  proposedGrade: string | null;
  communityGrade: string | null | undefined;
}) {
  let type = "";
  if (route.type === RouteType.BOULDER) {
    type = "Boulder";
  } else {
    type = "Rope";
  }
  let mappedGrade = "";
  if (route.grade?.startsWith("v")) {
    mappedGrade = getBoulderGradeMapping(route.grade);
  } else {
    mappedGrade = route.grade;
  }
  return (
    <>
      <div
        className={clsx("w-11/12 md:w-3/5 rounded-xl h-max font-barlow font-medium", {
          "bg-green-400/15 outline outline-green-400": route.color === "green",
          "bg-red-400/15 outline outline-red-400": route.color === "red",
          "bg-blue-400/15 outline outline-blue-400": route.color === "blue",
          "bg-yellow-400/15 outline outline-yellow-400": route.color === "yellow",
          "bg-purple-600/15 outline outline-purple-600": route.color === "purple",
          "bg-orange-400/15 outline outline-orange-400": route.color === "orange",
          "bg-white/35 outline outline-white": route.color === "white",
          "bg-slate-400/15 outline outline-slate-400": route.color === "defaultColor",
          "bg-pink-400/15 outline outline-pink-400": route.color === "pink",
          "bg-black/15 outline outline-white": route.color === "black",
        })}
      >
        <div className="p-4 flex md:gap-5 gap-3">
          {/* {route.images?.length > 0 ? (
            <ImageSlider images={route.images} />
          ) : ( */}
          <Image
            src={"https://utfs.io/f/bujx12z5cHJjc9Ak3DLO1WJXeZH487yuvrhiVgUb5MoAPlpN"}
            alt="Default climbing image"
            height={600}
            width={600}
            style={{ objectFit: "cover" }}
            className="w-32 h-40"
          />
          {/* )} */}
          <div className="h-40 bg-white w-px"></div>
          <div className="flex flex-col w-full gap-1">
            <h2 className="text-white text-2xl font-bold">{type}</h2>

            <div className="h-full flex flex-col justify-between">
              <div className="text-white md:text-base flex justify-between">
                <p>Grade: </p>
                <p>{mappedGrade}</p>
              </div>
              {route.grade.toLowerCase() !== "vfeature" &&
                route.grade.toLowerCase() !== "5.feature" && (
                  <div className="text-white md:text-base flex justify-between">
                    <p>Community Grade:</p> <p>{communityGrade}</p>
                  </div>
                )}
              <div className="text-white md:text-base flex justify-between">
                <p>Set Date:</p> <p>{date}</p>
              </div>
              <div className="text-white md:text-base flex justify-between">
                <p>Color:</p>
                <p>{route.color}</p>
              </div>
              <div className="text-white md:text-base flex justify-between">
                <p>Current Set?</p>
                <p>
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
      </div>
      <div className="flex mt-3 justify-center bg-slate-900 rounded-xl p-3 w-11/12 md:w-3/5">
        {starRating === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-white font-barlow font-bold">
              No Star Rating, Be the first one {"->"}
            </p>
            {user ? (
              <FunctionButton
                route={route}
                userId={user.id}
                isComplete={isComplete}
                isGraded={isGraded}
                proposedGrade={proposedGrade}
                intialMenu={"Star Rating Menu"}
                rating={rating}
                size={"size-8"}
              />
            ) : (
              <Link href={"/signin"}>
                <span className="text-white bg-blue-500 p-2 rounded-sm font-barlow font-bold">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex gap-5 justify-center">
            <StarRating rating={starRating} />{" "}
            {user && (
              <FunctionButton
                route={route}
                userId={user.id}
                isComplete={isComplete}
                isGraded={isGraded}
                proposedGrade={proposedGrade}
                intialMenu={"Star Rating Menu"}
                rating={rating}
                size={"size-8"}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex mt-3 justify-between w-11/12 md:w-3/5 gap-5">
        <StatCard value={totalSends ? totalSends : 0} label="Sends" />
        <StatCard value={daysOld} label="Days Old" />
      </div>
    </>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-full flex-col items-center rounded-xl bg-slate-900 p-4 shadow-lg">
      <h2 className="gradient-text-blue m-0 p-0 text-8xl font-bold">{value}</h2>
      <p className="m-0 p-0 text-lg font-semibold text-white">{label}</p>
    </div>
  );
}

export default async function IndividualRoute({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user || null;
  const { slug } = await params;
  const routeId = slug;

  const [route, starRating, totalSends, communityGrade, proposedGrade, isComplete, rating] =
    await Promise.all([
      getRouteById(routeId),
      // getRouteImagesById(routeId) || [],
      findStarRating(routeId),
      findAllTotalSends(routeId),
      findCommunityGrade(routeId),
      user ? findProposedGrade(user.id, routeId) : null,
      user ? findIfCompleted(user.id, routeId) : false,
      user ? findRating(user.id, routeId) : null,
    ]);
  const isGraded = proposedGrade !== null;

  if (!route) {
    return (
      <div className="text-white font-barlow font-bold flex justify-center items-center w-screen h-screen">
        404 Could not find route
      </div>
    );
  }

  const date = formatDateMMDDYY(route.setDate);

  const daysOld = findDaysOld(route.setDate);
  console.log(daysOld);

  return (
    <div className="w-screen flex items-center justify-center flex-col mt-10">
      <Header
        route={route}
        user={user as User}
        isComplete={isComplete}
        isGraded={isGraded}
        rating={rating}
        proposedGrade={proposedGrade}
      />
      <RouteInfo
        route={route}
        user={user as User}
        date={date}
        daysOld={daysOld}
        totalSends={totalSends}
        starRating={starRating}
        isComplete={isComplete}
        isGraded={isGraded}
        proposedGrade={proposedGrade}
        rating={rating}
        communityGrade={communityGrade}
      />
    </div>
  );
}
