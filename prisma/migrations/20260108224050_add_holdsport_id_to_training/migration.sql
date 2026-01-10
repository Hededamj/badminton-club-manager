-- AlterTable
ALTER TABLE "trainings" ADD COLUMN "holdsport_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "trainings_holdsport_id_key" ON "trainings"("holdsport_id");
