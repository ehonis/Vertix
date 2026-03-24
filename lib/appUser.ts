export type AppUser = {
  _id: string;
  _creationTime: number;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  clerkTokenIdentifier?: string;
  email: string;
  username?: string;
  name?: string;
  image?: string;
  phoneNumber?: string;
  emailVerified: null;
  password: null;
  role: "ADMIN" | "ROUTE_SETTER" | "USER";
  private: boolean;
  isOnboarded: boolean;
  highestRopeGrade?: string;
  highestBoulderGrade?: string;
  totalXp: number;
  tag: null;
  legacyPrismaId?: string;
  lastActiveGymId?: string;
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
    username: user.username ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    emailVerified: null,
    password: null,
    image: user.image ?? undefined,
    name: user.name ?? undefined,
    highestRopeGrade: user.highestRopeGrade ?? undefined,
    highestBoulderGrade: user.highestBoulderGrade ?? undefined,
    tag: null,
  };
}
