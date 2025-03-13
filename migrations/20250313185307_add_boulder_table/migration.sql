-- CreateTable
CREATE TABLE "MixerBoulder" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerBoulder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MixerBoulder" ADD CONSTRAINT "MixerBoulder_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
