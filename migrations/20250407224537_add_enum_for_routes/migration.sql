/*
  Warnings:

  - The `location` column on the `Route` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Locations" AS ENUM ('ropeNorthWest', 'ropeNorth', 'ropeNorthEast', 'ABWallNorth', 'ABWallSouth', 'ropeSouthWest', 'ropeSouthEast', 'boulderSouth', 'boulderMiddle', 'boulderNorthCave', 'boulderNorthSlab');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "location",
ADD COLUMN     "location" "Locations" NOT NULL DEFAULT 'boulderSouth';
