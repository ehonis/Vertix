/*
  Warnings:

  - You are about to drop the column `admin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `routeSetter` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ROUTE_SETTER', 'USER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "admin",
DROP COLUMN "routeSetter",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
