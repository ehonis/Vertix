/*
  Warnings:

  - You are about to drop the column `isLeaderboard` on the `TVSlide` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TVSlideType" AS ENUM ('LEADERBOARD', 'LOGO', 'IMAGE', 'TEXT');

-- AlterTable
ALTER TABLE "TVSlide" DROP COLUMN "isLeaderboard",
ADD COLUMN     "type" "TVSlideType" NOT NULL DEFAULT 'IMAGE';
