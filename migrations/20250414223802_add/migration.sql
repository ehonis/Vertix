/*
  Warnings:

  - The `type` column on the `Route` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('BOULDER', 'ROpe');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "type",
ADD COLUMN     "type" "RouteType" NOT NULL DEFAULT 'BOULDER';
