/*
  Warnings:

  - A unique constraint covering the columns `[climberId]` on the table `MixerBoulderScore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[climberId]` on the table `MixerRopeScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MixerBoulderScore_climberId_key" ON "MixerBoulderScore"("climberId");

-- CreateIndex
CREATE UNIQUE INDEX "MixerRopeScore_climberId_key" ON "MixerRopeScore"("climberId");
