import prisma from "@/prisma";

import { redirect } from "next/navigation";
// generate static pages
export async function generateStaticParams() {
  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
    },
  });
  return users.map(user => ({ slug: user.username! }));
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const username = slug;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

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
