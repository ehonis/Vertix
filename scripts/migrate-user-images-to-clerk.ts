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

type ImageMigrationCandidate = {
  id: string;
  clerkId: string | null;
  email: string;
  image: string | null;
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
      options.email = value.trim().toLowerCase();
      i += 1;
    }
  }

  if (options.limit !== null && Number.isNaN(options.limit)) {
    throw new Error("--limit must be a number");
  }

  return options;
}

function describeError(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: string;
      errors?: Array<{ code?: string; message?: string; longMessage?: string; meta?: unknown }>;
    };

    if (Array.isArray(maybeError.errors) && maybeError.errors.length > 0) {
      return maybeError.errors
        .map(item => {
          const code = item.code ? `[${item.code}] ` : "";
          const message = item.longMessage || item.message || "Unknown Clerk error";
          const meta = item.meta ? ` ${JSON.stringify(item.meta)}` : "";
          return `${code}${message}${meta}`;
        })
        .join(" | ");
    }

    if (maybeError.message) {
      return maybeError.message;
    }
  }

  return String(error);
}

async function fetchImageAsBlob(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Image fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const extension = contentType.split("/")[1]?.split(";")[0] || "bin";
  const blob = await response.blob();

  return new File([blob], `profile-image.${extension}`, { type: contentType });
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
        image: {
          not: null,
        },
      },
      orderBy: { createdAt: "asc" },
      take: options.limit ?? undefined,
      select: {
        id: true,
        clerkId: true,
        email: true,
        image: true,
      },
    });

    console.log(`Found ${users.length} Prisma users with images to inspect.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const user of users as ImageMigrationCandidate[]) {
      if (!user.image) {
        skippedCount += 1;
        console.log(`- Skipping ${user.email}: no image URL found`);
        continue;
      }

      if (!user.clerkId) {
        skippedCount += 1;
        console.log(`- Skipping ${user.email}: no linked Clerk user`);
        continue;
      }

      try {
        const clerkUser = await clerk.users.getUser(user.clerkId);

        if (clerkUser.imageUrl && !options.force) {
          skippedCount += 1;
          console.log(`- Skipping ${user.email}: Clerk profile image already exists`);
          continue;
        }

        if (options.dryRun) {
          migratedCount += 1;
          console.log(`- [dry-run] Would migrate image for ${user.email}`);
          continue;
        }

        let file: File;

        try {
          file = await fetchImageAsBlob(user.image);
        } catch (error) {
          throw new Error(`Could not fetch source image: ${describeError(error)}`);
        }

        const updatedClerkUser = await clerk.users.updateUserProfileImage(user.clerkId, {
          file,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            image: updatedClerkUser.imageUrl,
          },
        });

        migratedCount += 1;
        console.log(`- Migrated image for ${user.email}`);
      } catch (error) {
        failedCount += 1;
        console.error(`- Failed for ${user.email}: ${describeError(error)}`);
      }
    }

    console.log("Image migration complete.");
    console.log(`Migrated: ${migratedCount}`);
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
