/*
  Warnings:

  - The values [ropeNorth] on the enum `Locations` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Locations_new" AS ENUM ('ropeNorthWest', 'ropeNorthEast', 'ABWall', 'ropeSouthWest', 'ropeSouthEast', 'boulderSouth', 'boulderMiddle', 'boulderNorthCave', 'boulderNorthSlab');
ALTER TABLE "Route" ALTER COLUMN "location" DROP DEFAULT;
ALTER TABLE "Route" ALTER COLUMN "location" TYPE "Locations_new" USING ("location"::text::"Locations_new");
ALTER TYPE "Locations" RENAME TO "Locations_old";
ALTER TYPE "Locations_new" RENAME TO "Locations";
DROP TYPE "Locations_old";
ALTER TABLE "Route" ALTER COLUMN "location" SET DEFAULT 'boulderSouth';
COMMIT;
