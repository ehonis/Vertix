-- CreateTable
CREATE TABLE "RouteTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RouteTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RouteToRouteTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RouteToRouteTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteTag_name_key" ON "RouteTag"("name");

-- CreateIndex
CREATE INDEX "_RouteToRouteTag_B_index" ON "_RouteToRouteTag"("B");

-- AddForeignKey
ALTER TABLE "_RouteToRouteTag" ADD CONSTRAINT "_RouteToRouteTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RouteToRouteTag" ADD CONSTRAINT "_RouteToRouteTag_B_fkey" FOREIGN KEY ("B") REFERENCES "RouteTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
