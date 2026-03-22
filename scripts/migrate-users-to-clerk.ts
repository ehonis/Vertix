import "dotenv/config";

import { createClerkClient } from "@clerk/backend";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type ScriptOptions = {
  dryRun: boolean;
  limit: number | null;
  email: string | null;
  force: boolean;
};

function parseArgs(argv: string[]): ScriptOptions {
  const options: ScriptOptions = {
    dryRun: argv.includes("--dry-run"),
    limit: null,
    email: null,
    force: argv.includes("--force"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--limit") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --limit");
      }
      options.limit = Number.parseInt(value, 10);
      i += 1;
    }

    if (arg === "--email") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --email");
      }
      options.email = value.toLowerCase();
      i += 1;
    }
  }

  if (options.limit !== null && Number.isNaN(options.limit)) {
    throw new Error("--limit must be a number");
  }

  return options;
}

function splitName(name: string | null) {
  if (!name) {
    return { firstName: undefined, lastName: undefined };
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: undefined, lastName: undefined };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: undefined };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  try {
    const users = await prisma.user.findMany({
      where: {
        email: options.email ?? undefined,
      },
      orderBy: { createdAt: "asc" },
      take: options.limit ?? undefined,
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        username: true,
        phoneNumber: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        role: true,
        isOnboarded: true,
      },
    });

    console.log(`Found ${users.length} Prisma users to inspect.`);

    let createdCount = 0;
    let linkedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const user of users) {
      if (user.clerkId && !options.force) {
        skippedCount += 1;
        console.log(`- Skipping ${user.email}: already linked to Clerk (${user.clerkId})`);
        continue;
      }

      const existingClerkUsers = await clerk.users.getUserList({
        emailAddress: [user.email],
        limit: 1,
      });

      const matchedClerkUser = existingClerkUsers.data[0];

      try {
        if (matchedClerkUser) {
          if (!options.dryRun) {
            await clerk.users.updateUser(matchedClerkUser.id, {
              externalId: user.id,
              username: user.username ?? undefined,
              firstName: splitName(user.name).firstName,
              lastName: splitName(user.name).lastName,
              skipLegalChecks: true,
              privateMetadata: {
                prismaUserId: user.id,
                migratedFromPrisma: true,
                role: user.role,
                isOnboarded: user.isOnboarded,
              },
            });

            await prisma.user.update({
              where: { id: user.id },
              data: { clerkId: matchedClerkUser.id },
            });
          }

          linkedCount += 1;
          console.log(`- Linked existing Clerk user for ${user.email} -> ${matchedClerkUser.id}`);
          continue;
        }

        const { firstName, lastName } = splitName(user.name);

        if (!options.dryRun) {
          const createdClerkUser = await clerk.users.createUser({
            externalId: user.id,
            emailAddress: [user.email],
            phoneNumber: user.phoneNumber ? [user.phoneNumber] : undefined,
            username: user.username ?? undefined,
            firstName,
            lastName,
            createdAt: user.createdAt,
            skipPasswordRequirement: true,
            skipLegalChecks: true,
            privateMetadata: {
              prismaUserId: user.id,
              migratedFromPrisma: true,
              role: user.role,
              isOnboarded: user.isOnboarded,
              sourceEmailVerified: Boolean(user.emailVerified),
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { clerkId: createdClerkUser.id },
          });

          createdCount += 1;
          console.log(`- Created Clerk user for ${user.email} -> ${createdClerkUser.id}`);
          continue;
        }

        createdCount += 1;
        console.log(`- [dry-run] Would create Clerk user for ${user.email}`);
      } catch (error) {
        failedCount += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`- Failed for ${user.email}: ${message}`);
      }
    }

    console.log("Migration complete.");
    console.log(`Created: ${createdCount}`);
    console.log(`Linked existing: ${linkedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
