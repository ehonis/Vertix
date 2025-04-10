/*
  Warnings:

  - Added the required column `attempts` to the `MixerCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MixerCompletion" ADD COLUMN     "attempts" INTEGER NOT NULL,
ADD COLUMN     "holdNumber" INTEGER;
