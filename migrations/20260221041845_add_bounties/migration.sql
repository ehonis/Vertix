-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseXp" INTEGER NOT NULL DEFAULT 100,
    "dailyIncrementXp" INTEGER NOT NULL DEFAULT 50,
    "claimedByUserId" TEXT,
    "claimedOnCompletionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_claimedOnCompletionId_key" ON "Bounty"("claimedOnCompletionId");

-- CreateIndex
CREATE INDEX "Bounty_isActive_claimedAt_idx" ON "Bounty"("isActive", "claimedAt");

-- CreateIndex
CREATE INDEX "Bounty_routeId_isActive_claimedAt_idx" ON "Bounty"("routeId", "isActive", "claimedAt");

-- CreateIndex
CREATE INDEX "Bounty_startedAt_idx" ON "Bounty"("startedAt");

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_claimedOnCompletionId_fkey" FOREIGN KEY ("claimedOnCompletionId") REFERENCES "RouteCompletion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
