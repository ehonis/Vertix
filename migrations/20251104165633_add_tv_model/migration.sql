-- CreateTable
CREATE TABLE "TVSlide" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLeaderboard" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TVSlide_pkey" PRIMARY KEY ("id")
);
