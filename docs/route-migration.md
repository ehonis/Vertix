# Route Migration

This migration moves route-domain data from Neon/Postgres into Convex while keeping Prisma fallbacks available until validation is complete.

## Scope

Included in this migration:

- `RouteTag`
- `Route`
- `RouteImage`
- `RouteAttempt`
- `RouteCompletion`
- `RouteStar`
- `CommunityGrade`
- `MonthlyXp`

Excluded from this migration:

- `Bounty`
- `TVSlide`

## Required env

Application env:

- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_CONVEX_URL`
- `ROUTE_MIGRATION_SECRET`

## Alternative file-drop workflow

If direct Neon extraction is noisy or hard to validate, you can export Prisma tables to local JSON files and drop them into:

- `data/prisma-route-export`

See:

- `data/prisma-route-export/README.md`

That folder documents the exact files and shapes needed for the current route-domain migration, plus likely future tables.

Convex deployment env:

- `ROUTE_MIGRATION_SECRET`

## Dry run

Run a dry run first to verify lookups and unresolved references.

```bash
npm run migrate:routes-to-convex -- --dry-run
```

## Live run

```bash
npm run migrate:routes-to-convex
```

Optional flags:

- `--batch-size 50`
- `--skip-monthly-xp`

## What the script does

1. Reads source route-domain tables from Neon over the unpooled Postgres connection.
2. Reads Convex lookup tables for users, walls, zones, routes, and tags.
3. Maps Prisma ids to Convex ids using `legacyPrismaId` and seeded wall metadata.
4. Upserts data into Convex in dependency order.

## Validation checklist

- Compare Prisma and Convex counts for each migrated table.
- Verify unresolved users, walls, tags, and routes are zero or intentionally understood.
- Spot-check route lists on `/routes`.
- Spot-check a few users with completions, attempts, and monthly XP.
- Keep Prisma fallback reads enabled until validation is complete.
