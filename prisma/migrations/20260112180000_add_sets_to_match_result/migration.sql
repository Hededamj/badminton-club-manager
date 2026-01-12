-- AlterTable
ALTER TABLE "match_results" ADD COLUMN IF NOT EXISTS "sets" JSONB;
