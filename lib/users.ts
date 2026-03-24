import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

export async function getUserById(id: string) {
  return await createConvexServerClient().query(api.users.getUserById, { userId: id as any });
}
export async function getUserByUsername(username: string) {
  return await createConvexServerClient().query(api.users.getUserByUsername, { username });
}
