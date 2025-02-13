-- CreateEnum
CREATE TYPE "EntryMethod" AS ENUM ('APP', 'MANUAL');

-- AlterTable
ALTER TABLE "MixerClimber" ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "entryMethod" "EntryMethod" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "MixerCompetition" ADD COLUMN     "compEndTime" TIMESTAMP(3),
ADD COLUMN     "compStartTime" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'upcoming';

-- AddForeignKey
ALTER TABLE "MixerClimber" ADD CONSTRAINT "MixerClimber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
