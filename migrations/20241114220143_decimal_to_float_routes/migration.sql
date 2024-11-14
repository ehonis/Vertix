/*
  Warnings:

  - You are about to alter the column `starRating` on the `Route` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "starRating" SET DATA TYPE DOUBLE PRECISION;
