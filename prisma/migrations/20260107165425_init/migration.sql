-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PLAYER');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "player_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "holdsport_id" TEXT,
    "level" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_statistics" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "total_matches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "win_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_win_streak" INTEGER NOT NULL DEFAULT 0,
    "average_partner_level" DOUBLE PRECISION,
    "average_opponent_level" DOUBLE PRECISION,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "courts" INTEGER NOT NULL DEFAULT 6,
    "matches_per_court" INTEGER NOT NULL DEFAULT 3,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_players" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "training_id" TEXT,
    "tournament_id" TEXT,
    "court_number" INTEGER NOT NULL,
    "match_number" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_players" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "match_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "team1_score" INTEGER NOT NULL,
    "team2_score" INTEGER NOT NULL,
    "winning_team" INTEGER NOT NULL,
    "level_change" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "player1_id" TEXT NOT NULL,
    "player2_id" TEXT NOT NULL,
    "times_partnered" INTEGER NOT NULL DEFAULT 1,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "last_partnered" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oppositions" (
    "id" TEXT NOT NULL,
    "player1_id" TEXT NOT NULL,
    "player2_id" TEXT NOT NULL,
    "times_opposed" INTEGER NOT NULL DEFAULT 1,
    "player1_wins" INTEGER NOT NULL DEFAULT 0,
    "player2_wins" INTEGER NOT NULL DEFAULT 0,
    "last_opposed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oppositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "format" "TournamentFormat" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'PLANNED',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_player_id_key" ON "users"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_holdsport_id_key" ON "players"("holdsport_id");

-- CreateIndex
CREATE INDEX "players_level_idx" ON "players"("level");

-- CreateIndex
CREATE INDEX "players_is_active_idx" ON "players"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "player_statistics_player_id_key" ON "player_statistics"("player_id");

-- CreateIndex
CREATE INDEX "trainings_date_idx" ON "trainings"("date");

-- CreateIndex
CREATE INDEX "trainings_status_idx" ON "trainings"("status");

-- CreateIndex
CREATE INDEX "training_players_training_id_idx" ON "training_players"("training_id");

-- CreateIndex
CREATE INDEX "training_players_player_id_idx" ON "training_players"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_players_training_id_player_id_key" ON "training_players"("training_id", "player_id");

-- CreateIndex
CREATE INDEX "matches_training_id_idx" ON "matches"("training_id");

-- CreateIndex
CREATE INDEX "matches_tournament_id_idx" ON "matches"("tournament_id");

-- CreateIndex
CREATE INDEX "matches_court_number_idx" ON "matches"("court_number");

-- CreateIndex
CREATE INDEX "match_players_match_id_idx" ON "match_players"("match_id");

-- CreateIndex
CREATE INDEX "match_players_player_id_idx" ON "match_players"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_players_match_id_player_id_key" ON "match_players"("match_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_match_id_key" ON "match_results"("match_id");

-- CreateIndex
CREATE INDEX "partnerships_player1_id_idx" ON "partnerships"("player1_id");

-- CreateIndex
CREATE INDEX "partnerships_player2_id_idx" ON "partnerships"("player2_id");

-- CreateIndex
CREATE UNIQUE INDEX "partnerships_player1_id_player2_id_key" ON "partnerships"("player1_id", "player2_id");

-- CreateIndex
CREATE INDEX "oppositions_player1_id_idx" ON "oppositions"("player1_id");

-- CreateIndex
CREATE INDEX "oppositions_player2_id_idx" ON "oppositions"("player2_id");

-- CreateIndex
CREATE UNIQUE INDEX "oppositions_player1_id_player2_id_key" ON "oppositions"("player1_id", "player2_id");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_players" ADD CONSTRAINT "training_players_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_players" ADD CONSTRAINT "training_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oppositions" ADD CONSTRAINT "oppositions_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oppositions" ADD CONSTRAINT "oppositions_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
