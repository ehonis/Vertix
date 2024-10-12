/*
  Warnings:

  - You are about to drop the column `set_at` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "set_at",
ADD COLUMN     "setDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
