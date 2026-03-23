import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";

export default async function profile() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/");
  } else {
    redirect(`/profile/${user.username ?? user.id}`);
  }

  return <div>Redirecting to Profile</div>;
}
