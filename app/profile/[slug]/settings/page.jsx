import SettingsNavBar from "@/app/ui/profile/settings/settings-nav-bar";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/prisma";
import SignOut from "@/app/ui/general/sign-out-button";

export default async function Settings({ params }) {
  const session = await auth();
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: {
      username: slug,
    },
  });

  if (user && user.id === session?.user?.id) {
    return (
      <div className="w-screen flex flex-col items-center px-5 ">
        <div className="px-4 pt-2 flex flex-col gap-4 items-center w-full">
          <div className=" bg-black overflow-hidden flex justify-between items-center  md:w-lg w-xs">
            <h1 className=" font-barlow italic font-bold text-white text-3xl md:text-4xl">
              Settings
            </h1>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 md:size-14 stroke-white z-10 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
        </div>
        <div className="h-1 md:w-lg w-xs bg-white rounded-full mb-3 mt-1" />
        <div className="place-self-start w-full">
          <SettingsNavBar userData={user} />
        </div>
        <div className="px-2 flex justify-end w-full mt-2">
          <SignOut />
        </div>
      </div>
    );
  } else {
    redirect("/signin");
  }
}
