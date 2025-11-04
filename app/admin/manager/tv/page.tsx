import { Suspense } from "react";
import SkeletonSlides from "@/app/ui/admin/tv/skeleton-slides";
import FetchedSlides from "@/app/ui/admin/tv/fetched-slides";

export default function TVManager() {
  return (
    <div className="w-full flex justify-center font-barlow">
      <div className="md:w-full w-sm flex flex-col items-center mt-5  gap-5">
        <h1 className="text-white text-3xl font-bold">TV Manager</h1>
        <div className="flex justify-between items-center w-full md:px-32">
          <h1 className="text-white text-3xl font-bold">Current Slides</h1>
          <button className="purple-button text-white font-bold p-2 rounded-md">Preview</button>
        </div>
        <div className="bg-slate-900 p-5 rounded-md w-[80%] items-center justify-center  overflow-x-scroll">
          <Suspense fallback={<SkeletonSlides />}>
            <FetchedSlides />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
