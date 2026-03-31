import { redirect } from "next/navigation";
import ElementLoadingAnimation from "../ui/general/element-loading-animation";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export default async function Redirect() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/signin");
    return null;
  }

  // Check if user needs onboarding
  const dbUser = await createConvexServerClient().query(api.users.getUserById, {
    userId: user.id as any,
  });

  if (dbUser && !dbUser.isOnboarded) {
    redirect("/onboarding");
    return null;
  }

  // Legacy: Set username if missing (for old accounts)
  if (user && !user.username) {
    await createConvexServerClient().mutation(api.users.updateUserProfile, {
      userId: user.id as any,
      username: user.id,
    });
    redirect(`/profile/${user.id}/settings`);
    return null;
  }

  // Redirect signed-in users to routes by default
  redirect("/routes");

  return (
    <div className="flex flex-col h-screen-of-screen w-screen items-center justify-center font-barlow font-bold text-2xl">
      <p>Redirecting</p>
      <ElementLoadingAnimation />
    </div>
  );
}
