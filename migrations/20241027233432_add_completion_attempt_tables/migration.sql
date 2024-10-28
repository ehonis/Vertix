/*
  Warnings:

  - You are about to drop the `_attemptedRoutes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_completedRoutes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_attemptedRoutes" DROP CONSTRAINT "_attemptedRoutes_A_fkey";

-- DropForeignKey
ALTER TABLE "_attemptedRoutes" DROP CONSTRAINT "_attemptedRoutes_B_fkey";

-- DropForeignKey
ALTER TABLE "_completedRoutes" DROP CONSTRAINT "_completedRoutes_A_fkey";

-- DropForeignKey
ALTER TABLE "_completedRoutes" DROP CONSTRAINT "_completedRoutes_B_fkey";

-- DropTable
DROP TABLE "_attemptedRoutes";

-- DropTable
DROP TABLE "_completedRoutes";

-- CreateTable
CREATE TABLE "RouteCompletion" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteAttempt" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "attemptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouteCompletion" ADD CONSTRAINT "RouteCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteCompletion" ADD CONSTRAINT "RouteCompletion_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAttempt" ADD CONSTRAINT "RouteAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAttempt" ADD CONSTRAINT "RouteAttempt_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
