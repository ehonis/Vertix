-- DropForeignKey
ALTER TABLE "RouteAttempt" DROP CONSTRAINT "RouteAttempt_routeId_fkey";

-- DropForeignKey
ALTER TABLE "RouteImage" DROP CONSTRAINT "RouteImage_routeId_fkey";

-- AddForeignKey
ALTER TABLE "RouteImage" ADD CONSTRAINT "RouteImage_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAttempt" ADD CONSTRAINT "RouteAttempt_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
