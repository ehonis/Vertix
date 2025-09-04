/*
  Warnings:

  - You are about to drop the column `compDay` on the `BLCompetition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BLCompetition" DROP COLUMN "compDay",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "weekOneStartDate" TIMESTAMP(3),
ADD COLUMN     "weekThreeStartDate" TIMESTAMP(3),
ADD COLUMN     "weekTwoStartDate" TIMESTAMP(3);
