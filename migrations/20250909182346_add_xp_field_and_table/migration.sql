/*
  Warnings:

  - You are about to drop the column `holdNumber` on the `BLCompletion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BLCompletion" DROP COLUMN "holdNumber";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalXp" SMALLINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MonthlyXp" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "xp" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyXp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyXp_userId_idx" ON "MonthlyXp"("userId");

-- CreateIndex
CREATE INDEX "MonthlyXp_year_month_idx" ON "MonthlyXp"("year", "month");

-- CreateIndex
CREATE INDEX "MonthlyXp_userId_year_month_idx" ON "MonthlyXp"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyXp_userId_month_year_key" ON "MonthlyXp"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyXp" ADD CONSTRAINT "MonthlyXp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
