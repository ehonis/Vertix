import prisma from "@/prisma";

export async function findIfCommunityGraded(userId, routeId) {
  try {
    const communityGrade = await prisma.CommunityGrade.findFirst({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    return communityGrade !== null;
  } catch (error) {
    console.error("failed to get CommunityGrade status error: ", error);
    throw new Error("failed to check communityGrade status");
  }
}
