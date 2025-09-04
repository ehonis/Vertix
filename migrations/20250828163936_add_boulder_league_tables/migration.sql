-- CreateTable
CREATE TABLE "BLCompetition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'INACTIVE',
    "imageUrl" TEXT,
    "time" INTEGER NOT NULL DEFAULT 180,
    "compDay" TIMESTAMP(3),
    "passcode" TEXT,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "areScoresAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isTestCompetition" BOOLEAN NOT NULL DEFAULT false,
    "hasScoresBeenCalculated" BOOLEAN NOT NULL DEFAULT false,
    "standingsType" "StandingsType",
    "isBouldersReleased" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BLCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLBoulder" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "grade" TEXT,

    CONSTRAINT "BLBoulder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLClimber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divisionId" TEXT,
    "competitionId" TEXT NOT NULL,
    "entryMethod" "EntryMethod" NOT NULL DEFAULT 'MANUAL',
    "climberStatus" "ClimberStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BLClimber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLBoulderScore" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "BLBoulderScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLDivision" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "level" TEXT,

    CONSTRAINT "BLDivision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BLCompletion" (
    "id" TEXT NOT NULL,
    "climberId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "boulderId" TEXT,
    "attempts" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "holdNumber" INTEGER,
    "completionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isComplete" BOOLEAN,

    CONSTRAINT "BLCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BLBoulderScore_climberId_key" ON "BLBoulderScore"("climberId");

-- CreateIndex
CREATE UNIQUE INDEX "BLBoulderScore_climberId_competitionId_key" ON "BLBoulderScore"("climberId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "BLCompletion_climberId_boulderId_key" ON "BLCompletion"("climberId", "boulderId");

-- AddForeignKey
ALTER TABLE "BLBoulder" ADD CONSTRAINT "BLBoulder_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "BLCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLClimber" ADD CONSTRAINT "BLClimber_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "BLDivision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLClimber" ADD CONSTRAINT "BLClimber_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "BLCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLClimber" ADD CONSTRAINT "BLClimber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLBoulderScore" ADD CONSTRAINT "BLBoulderScore_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "BLClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLBoulderScore" ADD CONSTRAINT "BLBoulderScore_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "BLCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLDivision" ADD CONSTRAINT "BLDivision_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "BLCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLCompletion" ADD CONSTRAINT "BLCompletion_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "BLClimber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLCompletion" ADD CONSTRAINT "BLCompletion_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "BLCompetition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BLCompletion" ADD CONSTRAINT "BLCompletion_boulderId_fkey" FOREIGN KEY ("boulderId") REFERENCES "BLBoulder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
