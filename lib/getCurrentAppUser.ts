import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/prisma";

const appUserSelect = {
  id: true,
  clerkId: true,
  email: true,
  name: true,
  username: true,
  image: true,
  phoneNumber: true,
  role: true,
  highestRopeGrade: true,
  highestBoulderGrade: true,
  totalXp: true,
  isOnboarded: true,
  private: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CurrentAppUser = Awaited<ReturnType<typeof getCurrentAppUser>>;

function getClerkPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    emailAddress => emailAddress.id === clerkUser.primaryEmailAddressId
  );

  return primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
}

function getClerkImageUrl(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  return clerkUser?.imageUrl ?? null;
}

function getClerkName(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) {
    return null;
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return fullName || clerkUser.username || null;
}

export async function getCurrentAppUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email = getClerkPrimaryEmail(clerkUser);

  if (!email) {
    return null;
  }

  const name = getClerkName(clerkUser);
  const image = getClerkImageUrl(clerkUser);

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: appUserSelect,
  });

  if (existingByClerkId) {
    const shouldSyncProfile =
      existingByClerkId.email !== email ||
      existingByClerkId.name !== name ||
      existingByClerkId.image !== image;

    if (!shouldSyncProfile) {
      return existingByClerkId;
    }

    return prisma.user.update({
      where: { id: existingByClerkId.id },
      data: {
        email,
        name,
        image,
      },
      select: appUserSelect,
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: appUserSelect,
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId: userId,
        name: existingByEmail.name ?? name,
        image: existingByEmail.image ?? image,
      },
      select: appUserSelect,
    });
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      name,
      image,
      isOnboarded: false,
    },
    select: appUserSelect,
  });
}

export async function getCurrentAppSession() {
  const user = await getCurrentAppUser();

  if (!user) {
    return null;
  }

  return { user };
}
