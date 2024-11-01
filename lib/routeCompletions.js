import prisma from '@/prisma';

export async function getRouteCompletions(userId) {
  try {
    const userWithCompletions = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        completions: {
          include: {
            route: true, // Include related route details
          },
        },
      },
    });

    // Return just the completions if you don't need the user data
    return userWithCompletions ? userWithCompletions.completions : null;
  } catch (error) {
    console.error('Error fetching route completions:', error);
    throw new Error('Failed to fetch route completions');
  }
}
