/*
  Warnings:

  - You are about to drop the column `score` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MixerBoulderScore_climberId_key";

-- DropIndex
DROP INDEX "MixerRopeScore_climberId_key";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "score";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "score";
