/*
  Warnings:

  - The values [ROpe] on the enum `RouteType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RouteType_new" AS ENUM ('BOULDER', 'ROPE');
ALTER TABLE "Route" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Route" ALTER COLUMN "type" TYPE "RouteType_new" USING ("type"::text::"RouteType_new");
ALTER TYPE "RouteType" RENAME TO "RouteType_old";
ALTER TYPE "RouteType_new" RENAME TO "RouteType";
DROP TYPE "RouteType_old";
ALTER TABLE "Route" ALTER COLUMN "type" SET DEFAULT 'BOULDER';
COMMIT;
