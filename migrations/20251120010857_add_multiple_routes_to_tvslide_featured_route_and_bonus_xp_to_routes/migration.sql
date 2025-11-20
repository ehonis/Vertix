/*
  Warnings:

  - You are about to drop the column `routeId` on the `TVSlide` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TVSlide" DROP CONSTRAINT "TVSlide_routeId_fkey";

-- DropIndex
DROP INDEX "TVSlide_routeId_idx";

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "bonusXp" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "TVSlide" DROP COLUMN "routeId",
ADD COLUMN     "routesId" TEXT;

-- CreateTable
CREATE TABLE "_RouteToTVSlide" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RouteToTVSlide_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RouteToTVSlide_B_index" ON "_RouteToTVSlide"("B");

-- CreateIndex
CREATE INDEX "TVSlide_routesId_idx" ON "TVSlide"("routesId");

-- AddForeignKey
ALTER TABLE "_RouteToTVSlide" ADD CONSTRAINT "_RouteToTVSlide_A_fkey" FOREIGN KEY ("A") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RouteToTVSlide" ADD CONSTRAINT "_RouteToTVSlide_B_fkey" FOREIGN KEY ("B") REFERENCES "TVSlide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
