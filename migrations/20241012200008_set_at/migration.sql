/*
  Warnings:

  - You are about to drop the column `created_at` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "created_at",
ADD COLUMN     "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
