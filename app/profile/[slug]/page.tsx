import { redirect } from "next/navigation";
import { createConvexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const username = slug;

  const convex = createConvexServerClient();
  const userData = await convex.query(api.routes.getProfileDashboardData, { username });
  const user = userData?.user ?? null;

  if (!user) {
    redirect("/signin");
  }
  redirect(`/profile/${username}/dashboard`);

  return (
    <div className="w-screen">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
