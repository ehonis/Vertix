-- AlterTable
ALTER TABLE "RouteCompletion" ADD COLUMN     "flash" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "seenAnnouncement" BOOLEAN NOT NULL DEFAULT false;
