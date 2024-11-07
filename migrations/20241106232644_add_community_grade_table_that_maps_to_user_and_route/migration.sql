/*
  Warnings:

  - You are about to drop the column `communityGrade` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "communityGrade";

-- CreateTable
CREATE TABLE "CommunityGrade" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityGrade_userId_routeId_key" ON "CommunityGrade"("userId", "routeId");

-- AddForeignKey
ALTER TABLE "CommunityGrade" ADD CONSTRAINT "CommunityGrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityGrade" ADD CONSTRAINT "CommunityGrade_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
