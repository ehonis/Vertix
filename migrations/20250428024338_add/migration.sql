/*
  Warnings:

  - The `standingsType` column on the `MixerCompetition` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StandingsType" AS ENUM ('averageDownwardMovement', 'downMovementByTop');

-- AlterTable
ALTER TABLE "MixerCompetition" DROP COLUMN "standingsType",
ADD COLUMN     "standingsType" "StandingsType";
