-- DropForeignKey
ALTER TABLE "RouteCompletion" DROP CONSTRAINT "RouteCompletion_routeId_fkey";

-- AddForeignKey
ALTER TABLE "RouteCompletion" ADD CONSTRAINT "RouteCompletion_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
