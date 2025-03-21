import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface AdminPanel {
  text: string;
  url: string;
  svg: React.ReactNode;
}

export default async function AdminCenter() {
  const session = await auth();
  const user = session?.user || null;

  const adminPanels: AdminPanel[] = [
    {
      text: "Route Manager",
      url: "/admin/manager/routes",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-10 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
          />
        </svg>
      ),
    },
    {
      text: "Comp Manager",
      url: "/admin/manager/competitions",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-10 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      text: "User Manager",
      url: "/admin/manager/users",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-10 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
          />
        </svg>
      ),
    },
  ];

  if (!user || user?.admin === false) {
    redirect("/signin");
  } else {
    return (
      <div className="flex justify-center w-screen">
        <div className="flex p-5 flex-col w-full max-w-lg">
          <h1 className="text-white font-barlow font-bold text-3xl mb-3">Admin Center</h1>
          <div className="flex flex-col bg-bg2 gap-3 rounded-md p-5 mb-10">
            <Link
              className="bg-bg1 flex p-2 items-center w-full rounded-sm outline outline-white"
              href={"/admin/create"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                />
              </svg>
              <h3 className="text-white font-barlow font-bold text-2xl flex-1 text-center">
                Create Content
              </h3>
            </Link>
          </div>
          <h2 className="text-white font-barlow font-bold text-3xl mb-3">Content Manager</h2>
          <div className="flex flex-col bg-bg2 gap-5 rounded-md p-5 mb-10">
            {adminPanels.map((panel, index) => (
              <Link
                key={index}
                href={panel.url}
                className="bg-bg1 flex p-2 items-center w-full rounded-sm outline outline-white"
              >
                {panel.svg}
                <h3 className="text-white font-barlow font-bold text-2xl flex-1 text-center">
                  {panel.text}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
