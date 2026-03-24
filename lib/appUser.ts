export type AppUser = {
  _id: string;
  _creationTime: number;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string | null;
  clerkTokenIdentifier?: string | null;
  email: string;
  username: string | null;
  name: string | null;
  image: string | null;
  phoneNumber: string | null;
  emailVerified: null;
  password: null;
  role: "ADMIN" | "ROUTE_SETTER" | "USER";
  private: boolean;
  isOnboarded: boolean;
  highestRopeGrade: string | null;
  highestBoulderGrade: string | null;
  totalXp: number;
  tag: string | null;
  legacyPrismaId?: string | null;
  lastActiveGymId?: string | null;
};

export function normalizeAppUser(
  user: {
    _id: string;
    _creationTime: number;
    clerkId: string;
    clerkTokenIdentifier?: string;
    email: string;
    username?: string;
    name?: string;
    image?: string;
    phoneNumber?: string;
    role: "ADMIN" | "ROUTE_SETTER" | "USER";
    private: boolean;
    isOnboarded: boolean;
    highestRopeGrade?: string;
    highestBoulderGrade?: string;
    totalXp: number;
    legacyPrismaId?: string;
    lastActiveGymId?: string;
  } | null
): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user._id,
    createdAt: new Date(user._creationTime),
    updatedAt: new Date(user._creationTime),
    clerkId: user.clerkId ?? null,
    username: user.username ?? null,
    phoneNumber: user.phoneNumber ?? null,
    emailVerified: null,
    password: null,
    image: user.image ?? null,
    name: user.name ?? null,
    highestRopeGrade: user.highestRopeGrade ?? null,
    highestBoulderGrade: user.highestBoulderGrade ?? null,
    tag: null,
    clerkTokenIdentifier: user.clerkTokenIdentifier ?? null,
    legacyPrismaId: user.legacyPrismaId ?? null,
    lastActiveGymId: user.lastActiveGymId ?? null,
  };
}
