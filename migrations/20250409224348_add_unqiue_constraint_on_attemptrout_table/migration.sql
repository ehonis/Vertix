/*
  Warnings:

  - A unique constraint covering the columns `[userId,routeId]` on the table `RouteAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RouteAttempt_userId_routeId_key" ON "RouteAttempt"("userId", "routeId");
