/*
  Warnings:

  - You are about to drop the column `sends` on the `RouteCompletion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."RouteCompletion_userId_routeId_key";

-- AlterTable
ALTER TABLE "RouteCompletion" DROP COLUMN "sends",
ADD COLUMN     "xpEarned" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "RouteCompletion_userId_routeId_idx" ON "RouteCompletion"("userId", "routeId");
