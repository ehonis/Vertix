import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import { normalizeAppUser, type AppUser } from "@/lib/appUser";

export type CurrentAppUser = AppUser | null;

export async function getCurrentAppUser(): Promise<CurrentAppUser> {
  const { userId, getToken } = await auth();

  if (!userId) {
    return null;
  }

  const token = await getToken({ template: "convex" });
  const convex = createConvexServerClient(token);

  await convex.mutation(api.users.upsertCurrent, {});
  const user = await convex.query(api.users.getCurrent, {});
  return normalizeAppUser(user);
}

export async function getCurrentAppSession() {
  const user = await getCurrentAppUser();

  if (!user) {
    return null;
  }

  return { user };
}
