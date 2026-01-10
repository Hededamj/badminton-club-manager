-- AlterTable
ALTER TABLE "training_players" ADD COLUMN "paused" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "training_players" ADD COLUMN "paused_at" TIMESTAMP(3);
