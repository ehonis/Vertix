/*
  Warnings:

  - You are about to drop the column `compEndTime` on the `MixerCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `compStartTime` on the `MixerCompetition` table. All the data in the column will be lost.
  - You are about to drop the `MixerRank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MixerRank" DROP CONSTRAINT "MixerRank_climberId_fkey";

-- DropForeignKey
ALTER TABLE "MixerRank" DROP CONSTRAINT "MixerRank_competitionId_fkey";

-- AlterTable
ALTER TABLE "MixerCompetition" DROP COLUMN "compEndTime",
DROP COLUMN "compStartTime",
ADD COLUMN     "compDay" TIMESTAMP(3),
ADD COLUMN     "time" INTEGER;

-- DropTable
DROP TABLE "MixerRank";
