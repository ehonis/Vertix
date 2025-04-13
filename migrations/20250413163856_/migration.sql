/*
  Warnings:

  - You are about to drop the column `checkedIn` on the `MixerClimber` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ClimberStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "MixerClimber" DROP COLUMN "checkedIn",
ADD COLUMN     "climberStatus" "ClimberStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "MixerCompetition" ADD COLUMN     "passcode" TEXT;
