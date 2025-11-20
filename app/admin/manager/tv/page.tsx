import { Suspense } from "react";
import SkeletonSlides from "@/app/ui/admin/tv/skeleton-slides";
import FetchedSlides from "@/app/ui/admin/tv/fetched-slides";
import SkeletonDefaultSlides from "@/app/ui/admin/tv/skeleton-default-slides";
import FetchedDefaultSlides from "@/app/ui/admin/tv/fetched-default-slides";
import CreatedSlides from "@/app/ui/admin/tv/fetched-created-slides";
import AddButton from "@/app/ui/admin/tv/add-button";
import Link from "next/link";

export default function TVManager() {
  return (
    <div className="w-full flex justify-center font-barlow">
      <div className="w-full flex flex-col items-center mt-5  gap-5">
        <h1 className="text-white text-3xl font-bold">TV Manager</h1>
        <div className="flex justify-between items-center md:p-5 w-[80%]">
          <h1 className="text-white text-3xl font-bold">Current Slides</h1>
          <Link href="/tv" className="purple-button text-white font-bold p-2 rounded-md">
            View TV
          </Link>
        </div>
        <div className="flex bg-slate-900 p-5 rounded-md w-[80%] items-center  overflow-x-scroll">
          <Suspense fallback={<SkeletonSlides />}>
            <FetchedSlides />
          </Suspense>
        </div>

        <div className="flex justify-between items-center md:p-5 w-[80%]">
          <h2 className="text-white text-3xl font-bold">Default Slides</h2>
        </div>

        <div className=" md:p-5 rounded-md w-[80%] flex">
          <Suspense fallback={<SkeletonDefaultSlides />}>
            <FetchedDefaultSlides />
          </Suspense>
        </div>

        <div className="flex justify-between items-center  md:p-5 w-[80%]">
          <h2 className="text-white text-3xl font-bold">Created Slides & Featured Routes</h2>
          <AddButton />
        </div>

        <div className=" md:p-5 rounded-md w-[80%] items-center justify-center  flex">
          <Suspense fallback={<SkeletonDefaultSlides />}>
            <CreatedSlides />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
