import { getRouteById, getRouteImagesById } from '@/lib/routes';
import Image from 'next/image';
import clsx from 'clsx';
import ImageSlider from '@/app/ui/routes/individualRoutePage/route-image-slider';
import FunctionButton from '@/app/ui/routes/individualRoutePage/function-button';
import { findIfCompleted } from '@/lib/routeCompletions';
import { formatDate } from '@/lib/routeScripts';
import { auth } from '@/auth';
import Link from 'next/link';

export default async function IndividualRoute({ params }) {
  const session = await auth();
  const routeId = params.slug;
  const user = session?.user || null;
  const images = await getRouteImagesById(routeId);
  const route = await getRouteById(routeId);
  const color = route.color;
  const date = formatDate(route.setDate);
  if (user) {
    const isComplete = await findIfCompleted(user.id, routeId);
    return (
      <div className="w-screen flex items-center justify-center flex-col mt-10">
        <div className="flex w-4/5 md:w-3/5 justify-between items-center mb-4">
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
          <FunctionButton
            route={route}
            userId={user.id}
            isComplete={isComplete}
          />
        </div>
        <div className="w-4/5 md:w-3/5 bg-bg1 h-max">
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
          <div className="p-5 flex gap-5">
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
                <p className="text-white">Grade: {route.grade}</p>
                <p className="text-white">
                  Community Grade: {route.communityGrade}
                </p>
                <p className="text-white">Set Date: {date}</p>
                <p className="text-white">
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
      </div>
    );
  } else {
    return (
      <div className="w-screen flex items-center justify-center flex-col mt-10">
        <div className="flex w-4/5 md:w-3/5  justify-between items-center mb-4">
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
        <div className="w-4/5 md:w-3/5 bg-bg1 h-max">
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
          <div className="p-5 flex gap-5">
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
                <p className="text-white">Grade: {route.grade}</p>
                <p className="text-white">
                  Community Grade: {route.communityGrade}
                </p>
                <p className="text-white">Set Date: {date}</p>
                <p className="text-white">
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
      </div>
    );
  }
}
