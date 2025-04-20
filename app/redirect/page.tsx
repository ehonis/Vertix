import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";
export default async function Redirect() {
  const session = await auth();
  const user = session?.user;

  if (user && !user.username) {
    await prisma.user.update({
      where: { id: user?.id },
      data: { username: user?.id },
    });
    redirect(`/profile/${user?.id}/settings`);
  } else {
    redirect(`/profile/${user?.username}/dashboard`);
  }

  return (
    <div className="flex flex-col h-screen-of-screen w-screen items-center justify-center font-barlow font-bold text-2xl">
      <p>Redirecting</p>
      <ElementLoadingAnimation />
    </div>
  );
}
