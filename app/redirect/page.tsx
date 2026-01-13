import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/prisma";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";

export default async function Redirect() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
    return null;
  }

  // Check if user needs onboarding
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isOnboarded: true, username: true, phoneNumber: true },
  });

  // If user was created by NextAuth and doesn't have isOnboarded set, set it to false
  if (dbUser && dbUser.isOnboarded === null) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnboarded: false },
    });
    redirect("/onboarding");
    return null;
  }

  if (dbUser && !dbUser.isOnboarded) {
    redirect("/onboarding");
    return null;
  }

  // Legacy: Set username if missing (for old accounts)
  if (user && !user.username) {
    await prisma.user.update({
      where: { id: user?.id },
      data: { username: user?.id },
    });
    redirect(`/profile/${user?.id}/settings`);
    return null;
  }

  // Redirect to home
  redirect("/");

  return (
    <div className="flex flex-col h-screen-of-screen w-screen items-center justify-center font-barlow font-bold text-2xl">
      <p>Redirecting</p>
      <ElementLoadingAnimation />
    </div>
  );
}
