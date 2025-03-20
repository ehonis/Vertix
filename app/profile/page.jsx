import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function profile() {
  const session = await auth();
  if (!session) {
    redirect("/");
  } else {
    redirect(`/profile/${session.user.username}`);
  }
  return <div>Redirecting to Profile</div>;
}
