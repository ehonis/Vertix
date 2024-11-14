-- DropForeignKey
ALTER TABLE "CommunityGrade" DROP CONSTRAINT "CommunityGrade_routeId_fkey";

-- AddForeignKey
ALTER TABLE "CommunityGrade" ADD CONSTRAINT "CommunityGrade_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
