-- CreateTable
CREATE TABLE "MixerCompetition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MixerCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerRoute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "holds" JSONB NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerClimber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divisionId" TEXT,
    "competitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MixerClimber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerDivision" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerDivision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerBoulderScore" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerBoulderScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerRopeScore" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerRopeScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixerRank" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "boulderRank" INTEGER NOT NULL,
    "ropeRank" INTEGER NOT NULL,
    "combinedRank" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "MixerRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MixerClimber_name_key" ON "MixerClimber"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MixerBoulderScore_climberId_key" ON "MixerBoulderScore"("climberId");

-- CreateIndex
CREATE UNIQUE INDEX "MixerRopeScore_climberId_key" ON "MixerRopeScore"("climberId");

-- CreateIndex
CREATE UNIQUE INDEX "MixerRank_climberId_key" ON "MixerRank"("climberId");

-- AddForeignKey
ALTER TABLE "MixerRoute" ADD CONSTRAINT "MixerRoute_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerClimber" ADD CONSTRAINT "MixerClimber_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "MixerDivision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerClimber" ADD CONSTRAINT "MixerClimber_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerDivision" ADD CONSTRAINT "MixerDivision_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerBoulderScore" ADD CONSTRAINT "MixerBoulderScore_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "MixerClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerBoulderScore" ADD CONSTRAINT "MixerBoulderScore_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerRopeScore" ADD CONSTRAINT "MixerRopeScore_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "MixerClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerRopeScore" ADD CONSTRAINT "MixerRopeScore_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerRank" ADD CONSTRAINT "MixerRank_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "MixerClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixerRank" ADD CONSTRAINT "MixerRank_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "MixerCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
