/*
  Warnings:

  - You are about to drop the column `time` on the `BLCompetition` table. All the data in the column will be lost.
  - Added the required column `week` to the `BLBoulder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BLBoulder" ADD COLUMN     "week" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BLCompetition" DROP COLUMN "time",
ADD COLUMN     "activeWeek" INTEGER NOT NULL DEFAULT 1;
