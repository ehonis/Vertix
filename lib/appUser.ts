import type { CurrentAppUser } from "@/lib/getCurrentAppUser";

export type AppUser = NonNullable<CurrentAppUser>;

export function normalizeAppUser<T extends CurrentAppUser>(user: T) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    username: user.username ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    image: user.image ?? undefined,
    name: user.name ?? undefined,
    highestRopeGrade: user.highestRopeGrade ?? undefined,
    highestBoulderGrade: user.highestBoulderGrade ?? undefined,
  };
}
