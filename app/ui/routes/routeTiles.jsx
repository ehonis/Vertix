import Link from 'next/link';
import RouteTile from './routeTile';

export default function RouteTiles({ ropes, boulders }) {
  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex justify-between px-5 pt-5 pb-1">
          <div>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Filter
              </span>
            </button>
          </div>
          <div className="flex gap-5">
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                Search
              </span>
            </button>
            <button className="relative bg-transparent text-white outline outline-1 outline-white px-3 overflow-hidden group ">
              <span className="absolute inset-0 bg-white transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></span>
              <span className="relative group-hover:text-black transition-all duration-500">
                quickFilter
              </span>
            </button>
          </div>
        </div>
        <div className="flex gap-5 p-5">
          <div className="bg-bg1 w-[22rem] h-full rounded-xl">
            <div className="p-4">
              <h2 className="text-white font-bold text-3xl">Ropes</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {ropes.map((route) => {
                return (
                  <Link href={`routes/${route.id}`} key={route.id}>
                    <RouteTile
                      color={route.color}
                      name={route.title}
                      grade={route.grade}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-bg1 w-[22rem] h-full rounded-xl">
            <div className="p-4">
              <h2 className="text-white font-bold text-3xl">Boulders</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {boulders.map((route) => {
                return (
                  <Link href={`routes/${route.id}`} key={route.id}>
                    <RouteTile
                      color={route.color}
                      name={route.title}
                      grade={route.grade}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
