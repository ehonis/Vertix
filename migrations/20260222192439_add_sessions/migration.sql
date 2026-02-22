-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('AUTO', 'POWER', 'POWER_ENDURANCE', 'TENSION_BOARD', 'COMPETITION', 'ENDURANCE', 'WORKOUT', 'CUSTOM', 'FUN');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('ONE_DAY_COMP', 'THREE_WEEK_COMP');

-- AlterTable
ALTER TABLE "RouteCompletion" ADD COLUMN     "competitionId" TEXT,
ADD COLUMN     "competitionType" "CompetitionType",
ADD COLUMN     "isCompetition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "ClimbingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SessionType" NOT NULL DEFAULT 'AUTO',
    "name" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSlot" TEXT,
    "isRetroactive" BOOLEAN NOT NULL DEFAULT false,
    "isCompetition" BOOLEAN NOT NULL DEFAULT false,
    "competitionType" "CompetitionType",
    "competitionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClimbingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClimbingSession_userId_status_idx" ON "ClimbingSession"("userId", "status");

-- CreateIndex
CREATE INDEX "ClimbingSession_userId_sessionDate_idx" ON "ClimbingSession"("userId", "sessionDate");

-- CreateIndex
CREATE INDEX "ClimbingSession_userId_lastActivityAt_idx" ON "ClimbingSession"("userId", "lastActivityAt");

-- CreateIndex
CREATE INDEX "ClimbingSession_competitionType_competitionId_idx" ON "ClimbingSession"("competitionType", "competitionId");

-- CreateIndex
CREATE INDEX "RouteCompletion_sessionId_idx" ON "RouteCompletion"("sessionId");

-- CreateIndex
CREATE INDEX "RouteCompletion_userId_completionDate_idx" ON "RouteCompletion"("userId", "completionDate");

-- CreateIndex
CREATE INDEX "RouteCompletion_competitionType_competitionId_idx" ON "RouteCompletion"("competitionType", "competitionId");

-- AddForeignKey
ALTER TABLE "ClimbingSession" ADD CONSTRAINT "ClimbingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteCompletion" ADD CONSTRAINT "RouteCompletion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClimbingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
