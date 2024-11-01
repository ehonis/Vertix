/*
  Warnings:

  - A unique constraint covering the columns `[userId,routeId]` on the table `RouteCompletion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RouteCompletion_userId_routeId_key" ON "RouteCompletion"("userId", "routeId");
