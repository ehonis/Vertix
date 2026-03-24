/*
  Warnings:

  - You are about to drop the column `sessionId` on the `RouteCompletion` table. All the data in the column will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLBoulder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLBoulderScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLClimber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLCompetition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLCompletion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BLDivision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClimbingSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerBoulder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerBoulderScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerClimber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerCompetition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerCompletion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerDivision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerRopeScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MixerRoute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAnnouncement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BLBoulder" DROP CONSTRAINT "BLBoulder_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "BLBoulderScore" DROP CONSTRAINT "BLBoulderScore_climberId_fkey";

-- DropForeignKey
ALTER TABLE "BLBoulderScore" DROP CONSTRAINT "BLBoulderScore_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "BLClimber" DROP CONSTRAINT "BLClimber_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "BLClimber" DROP CONSTRAINT "BLClimber_divisionId_fkey";

-- DropForeignKey
ALTER TABLE "BLClimber" DROP CONSTRAINT "BLClimber_userId_fkey";

-- DropForeignKey
ALTER TABLE "BLCompletion" DROP CONSTRAINT "BLCompletion_boulderId_fkey";

-- DropForeignKey
ALTER TABLE "BLCompletion" DROP CONSTRAINT "BLCompletion_climberId_fkey";

-- DropForeignKey
ALTER TABLE "BLCompletion" DROP CONSTRAINT "BLCompletion_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "BLDivision" DROP CONSTRAINT "BLDivision_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "ClimbingSession" DROP CONSTRAINT "ClimbingSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "MixerBoulder" DROP CONSTRAINT "MixerBoulder_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerBoulderScore" DROP CONSTRAINT "MixerBoulderScore_climberId_fkey";

-- DropForeignKey
ALTER TABLE "MixerBoulderScore" DROP CONSTRAINT "MixerBoulderScore_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerClimber" DROP CONSTRAINT "MixerClimber_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerClimber" DROP CONSTRAINT "MixerClimber_divisionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerClimber" DROP CONSTRAINT "MixerClimber_userId_fkey";

-- DropForeignKey
ALTER TABLE "MixerCompletion" DROP CONSTRAINT "MixerCompletion_climberId_fkey";

-- DropForeignKey
ALTER TABLE "MixerCompletion" DROP CONSTRAINT "MixerCompletion_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerCompletion" DROP CONSTRAINT "MixerCompletion_mixerBoulderId_fkey";

-- DropForeignKey
ALTER TABLE "MixerCompletion" DROP CONSTRAINT "MixerCompletion_mixerRouteId_fkey";

-- DropForeignKey
ALTER TABLE "MixerDivision" DROP CONSTRAINT "MixerDivision_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerRopeScore" DROP CONSTRAINT "MixerRopeScore_climberId_fkey";

-- DropForeignKey
ALTER TABLE "MixerRopeScore" DROP CONSTRAINT "MixerRopeScore_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "MixerRoute" DROP CONSTRAINT "MixerRoute_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "RouteCompletion" DROP CONSTRAINT "RouteCompletion_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "UserAnnouncement" DROP CONSTRAINT "UserAnnouncement_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "UserAnnouncement" DROP CONSTRAINT "UserAnnouncement_userId_fkey";

-- DropIndex
DROP INDEX "RouteCompletion_sessionId_idx";

-- AlterTable
ALTER TABLE "RouteCompletion" DROP COLUMN "sessionId";

-- DropTable
DROP TABLE "Announcement";

-- DropTable
DROP TABLE "BLBoulder";

-- DropTable
DROP TABLE "BLBoulderScore";

-- DropTable
DROP TABLE "BLClimber";

-- DropTable
DROP TABLE "BLCompetition";

-- DropTable
DROP TABLE "BLCompletion";

-- DropTable
DROP TABLE "BLDivision";

-- DropTable
DROP TABLE "ClimbingSession";

-- DropTable
DROP TABLE "MixerBoulder";

-- DropTable
DROP TABLE "MixerBoulderScore";

-- DropTable
DROP TABLE "MixerClimber";

-- DropTable
DROP TABLE "MixerCompetition";

-- DropTable
DROP TABLE "MixerCompletion";

-- DropTable
DROP TABLE "MixerDivision";

-- DropTable
DROP TABLE "MixerRopeScore";

-- DropTable
DROP TABLE "MixerRoute";

-- DropTable
DROP TABLE "UserAnnouncement";

-- DropEnum
DROP TYPE "ClimberStatus";

-- DropEnum
DROP TYPE "CompetitionStatus";

-- DropEnum
DROP TYPE "CompletionType";

-- DropEnum
DROP TYPE "EntryMethod";

-- DropEnum
DROP TYPE "SessionStatus";

-- DropEnum
DROP TYPE "SessionType";

-- DropEnum
DROP TYPE "StandingsType";
