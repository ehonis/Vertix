import prisma from '../prisma';

async function main() {
  const routes = await prisma.route.findMany();
  console.log(routes);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
