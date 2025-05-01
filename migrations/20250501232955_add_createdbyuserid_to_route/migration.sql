-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "createdByUserID" TEXT;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_createdByUserID_fkey" FOREIGN KEY ("createdByUserID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
