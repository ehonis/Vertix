/*
  Warnings:

  - The `status` column on the `MixerCompetition` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('INACTIVE', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DEMO');

-- AlterTable
ALTER TABLE "MixerCompetition" DROP COLUMN "status",
ADD COLUMN     "status" "CompetitionStatus" NOT NULL DEFAULT 'INACTIVE';
