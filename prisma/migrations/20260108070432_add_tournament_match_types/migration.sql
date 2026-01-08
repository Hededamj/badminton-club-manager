-- CreateEnum
CREATE TYPE "TournamentMatchType" AS ENUM ('MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES', 'SINGLES');

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "match_types" "TournamentMatchType"[] DEFAULT ARRAY['MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES']::"TournamentMatchType"[];
