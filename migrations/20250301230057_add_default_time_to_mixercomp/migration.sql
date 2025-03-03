/*
  Warnings:

  - Made the column `time` on table `MixerCompetition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MixerCompetition" ALTER COLUMN "time" SET NOT NULL;
