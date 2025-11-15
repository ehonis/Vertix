-- AlterTable
ALTER TABLE "TVSlide" ADD COLUMN     "routeId" TEXT;

-- CreateIndex
CREATE INDEX "TVSlide_routeId_idx" ON "TVSlide"("routeId");

-- AddForeignKey
ALTER TABLE "TVSlide" ADD CONSTRAINT "TVSlide_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
