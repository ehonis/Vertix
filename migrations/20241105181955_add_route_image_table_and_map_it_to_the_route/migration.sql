-- CreateTable
CREATE TABLE "RouteImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouteImage" ADD CONSTRAINT "RouteImage_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
