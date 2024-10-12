// updateRoutes.js

const { PrismaClient } = require('@prisma/client'); // Adjust this if necessary
const prisma = new PrismaClient();

async function updateExistingRoutes() {
  const routes = await prisma.route.findMany();

  for (const route of routes) {
    await prisma.route.update({
      where: { id: route.id },
      data: { color: 'defaultColor' }, // Set your desired default color
    });
  }
}

updateExistingRoutes()
  .then(() => {
    console.log('Updated existing routes with default color.');
  })
  .catch((error) => {
    console.error('Error updating routes:', error);
  })
  .finally(() => {
    prisma.$disconnect(); // Ensure to disconnect the Prisma client
  });
