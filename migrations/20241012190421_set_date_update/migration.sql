/*
  Warnings:

  - You are about to drop the column `setDate` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "setDate",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
