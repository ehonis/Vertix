-- CreateEnum
CREATE TYPE "CompletionType" AS ENUM ('BOULDER', 'ROPE');

-- CreateTable
CREATE TABLE "MixerCompletion" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "type" "CompletionType" NOT NULL,
    "mixerRouteId" TEXT,
    "mixerBoulderId" TEXT,
    "points" INTEGER NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MixerCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MixerCompletion_climberId_mixerRouteId_key" ON "MixerCompletion"("climberId", "mixerRouteId");

-- CreateIndex
CREATE UNIQUE INDEX "MixerCompletion_climberId_mixerBoulderId_key" ON "MixerCompletion"("climberId", "mixerBoulderId");

-- AddForeignKey
ALTER TABLE "MixerCompletion" ADD CONSTRAINT "MixerCompletion_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "MixerClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerCompletion" ADD CONSTRAINT "MixerCompletion_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerCompletion" ADD CONSTRAINT "MixerCompletion_mixerRouteId_fkey" FOREIGN KEY ("mixerRouteId") REFERENCES "MixerRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerCompletion" ADD CONSTRAINT "MixerCompletion_mixerBoulderId_fkey" FOREIGN KEY ("mixerBoulderId") REFERENCES "MixerBoulder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
