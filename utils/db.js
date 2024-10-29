import prisma from '@/prisma';

export async function getUserFromDb(email, pwHash) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and compare password hash
    if (user && (await bcrypt.compare(pwHash, user.password))) {
      return user; // Return user if password matches
    } else {
      return null; // Return null if user not found or password doesn't match
    }
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
}
