-- AlterTable
ALTER TABLE "MixerDivision" ADD COLUMN     "level" TEXT;

-- AlterTable
ALTER TABLE "_BadgeToUser" ADD CONSTRAINT "_BadgeToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BadgeToUser_AB_unique";
