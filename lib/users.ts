import prisma from "@/prisma";

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
   
  });
  return user;
}
export async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}

