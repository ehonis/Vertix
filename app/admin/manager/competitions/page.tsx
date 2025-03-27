import Link from "next/link";
import UpComingCompetitions from "@/app/ui/admin/competitions/upcoming-competitions";
import { Suspense } from "react";
import ElementLoadingAnimation from "@/app/ui/general/element-loading-animation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const compTypes = [{ text: "Mixer", url: "/admin/manager/competitions/mixer" }];
  const session = await auth();
  const user = session?.user || null;

  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="w-screen p-5 flex flex-col items-center">
      <div className="max-w-md flex-col flex">
        <Link href={"/admin"} className="flex gap-1 items-center ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <p className="font-barlow font-bold text-xs text-white">Admin Center</p>
        </Link>
        <div className="mt-3 flex flex-col">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="font-barlow font-bold text-white text-4xl">Competitions Manager</h1>
            <div className="h-[2px] w-full bg-white"></div>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            <h2 className="font-barlow font-bold text-white text-2xl">Types</h2>
            <div className="flex flex-col bg-slate-900 gap-2 p-2 rounded-sm">
              {compTypes.map(type => (
                <Link
                  href={type.url}
                  className="bg-gray-700 max-w-md grid grid-cols-3 font-barlow font-bold text-white p-3 rounded-sm  "
                  key={type.text}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                    />
                  </svg>
                  <p className="text-2xl text-center">{type.text}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-barlow font-bold text-white text-2xl">Upcoming Competitions</h2>
            <Suspense fallback={<ElementLoadingAnimation />}>
              <UpComingCompetitions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
