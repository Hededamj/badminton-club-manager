# Badminton Club Manager

En webbaseret app til administration af badmintonklub-træninger, kampfordeling, statistik og turneringer.

## Features

- **Spilleradministration**: Håndter klubbens medlemmer med ELO-rating system
- **Træningsplanlægning**: Opret træninger og tilmeld spillere
- **Intelligent Matchmaking**: Automatisk kampfordeling baseret på niveau og historik
- **Resultatregistrering**: Hurtig indtastning af kampresultater med automatisk ELO-opdatering
- **Statistik**: Detaljeret spillerstatistik, rankings og performance tracking
- **Turneringer**: Separat turneringssystem til klubarrangementer
- **Brugeradgang**: Admin og spiller-roller med forskellige rettigheder

## Teknologier

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL med Prisma ORM
- **Authentication**: NextAuth.js v4
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel

## Kom i gang - Lokal udvikling

### 1. Klon repository

```bash
git clone <your-repo-url>
cd badminton
```

### 2. Installer dependencies

```bash
npm install
```

### 3. Opsæt database

Du har to muligheder:

#### Option A: Lokal PostgreSQL

1. Installer PostgreSQL lokalt
2. Opret en database: `createdb badminton`
3. Opdater `DATABASE_URL` i `.env.local`

#### Option B: Vercel Postgres (Cloud)

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Opret et nyt Storage → Postgres
3. Kopier DATABASE_URL fra Vercel til `.env.local`

### 4. Opret .env.local fil

Kopier `.env.example` til `.env.local` og udfyld:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generer-med-kommandoen-nedenfor"
NODE_ENV="development"
```

Generer NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 5. Kør database migrationer

```bash
npm run prisma:migrate
```

### 6. Opret admin bruger

Kør følgende kommando i Prisma Studio eller direkte i databasen:

```bash
npm run prisma:studio
```

Alternativt, opret via SQL:

```sql
-- Først, opret en player
INSERT INTO players (id, name, email, level, is_active, created_at, updated_at)
VALUES ('admin-player-id', 'Admin Navn', 'admin@badminton.dk', 1500, true, NOW(), NOW());

-- Derefter, opret en admin user (password er 'admin123')
-- Hash af 'admin123': $2a$10$8ZqJZ... (brug bcrypt til at generere)
INSERT INTO users (id, email, password_hash, role, player_id, created_at, updated_at)
VALUES ('admin-user-id', 'admin@badminton.dk', '$2a$10$...(din hash her)', 'ADMIN', 'admin-player-id', NOW(), NOW());
```

Eller brug dette Node.js script:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"
```

### 7. Start udviklingsserver

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i din browser.

Log ind med:
- Email: `admin@badminton.dk`
- Password: `admin123`

## Deployment til Vercel

### 1. Push til GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Opret projekt på Vercel

1. Gå til [Vercel Dashboard](https://vercel.com/new)
2. Importer dit GitHub repository
3. Vercel vil automatisk detektere Next.js

### 3. Opsæt miljøvariabler på Vercel

Tilføj følgende i Vercel → Settings → Environment Variables:

```
DATABASE_URL = <din-vercel-postgres-url>
NEXTAUTH_URL = <din-vercel-url> (fx https://badminton.vercel.app)
NEXTAUTH_SECRET = <samme-som-lokalt>
NODE_ENV = production
```

### 4. Opret Vercel Postgres

1. Gå til dit projekt på Vercel
2. Storage → Create Database → Postgres
3. Kopier DATABASE_URL til Environment Variables

### 5. Kør migrationer i production

Fra Vercel dashboard eller via CLI:

```bash
vercel env pull .env.local
npm run prisma:migrate:deploy
```

### 6. Opret admin bruger i production

Brug Prisma Studio eller direkte SQL via Vercel Postgres Dashboard.

### 7. Deploy

Vercel deployer automatisk ved hver push til `main` branch.

## Database Schema

Databasen består af følgende hovedmodeller:

- **User**: Authentication (admin/spiller roller)
- **Player**: Spillerprofiler med ELO-rating
- **PlayerStatistics**: Aggregeret statistik
- **Training**: Træningssessioner
- **TrainingPlayer**: Spillere tilmeldt træning
- **Match**: Individuelle kampe
- **MatchPlayer**: 4 spillere pr. kamp
- **MatchResult**: Kampresultater og score
- **Partnership**: Historie af makkerskaber
- **Opposition**: Historie af modstandere
- **Tournament**: Turneringsdata

## Matchmaking Algoritme

Systemet bruger en avanceret matchmaking-algoritme der:

1. **ELO Rating**: Alle spillere starter på 1500 og opdateres efter hver kamp
2. **Team Balance**: Minimerer forskel i holdstyrs (gennemsnitsrating)
3. **Varieret Partnere**: Prioriterer nye makkerskaber
4. **Varieret Modstandere**: Undgår gentagne matchups
5. **Spillerpause**: Sikrer spillere ikke spiller flere kampe i træk

Vægtning:
- Niveau-balance: 10x
- Partnervarietet: 5x
- Modstandervarietet: 3x
- Pausetid: 8x

## Udvikling - Næste Trin

Phase 1 er nu komplet! Her er de næste faser:

### Phase 2: Player Management
- CRUD operationer for spillere
- Holdsport import (copy/paste spillerliste)
- Spillerstatistik visning
- Søg og filtrering

### Phase 3: Training Management
- Opret og rediger træninger
- Spillervalg til træninger
- Visuel banfordeling

### Phase 4: Matchmaking Algorithm
- Implementer ELO-system
- Byg matchmaking-algoritme
- Automatisk kampgenerering

### Phase 5: Results & Statistics
- Resultatregistrering
- Automatisk ELO-opdatering
- Statistik dashboard med grafer

### Phase 6: Tournament Mode
- Turneringsoprettelse
- Bracket visualisering
- Turneringsresultater

### Phase 7: Polish & Optimization
- Framer Motion animationer
- Performance optimering
- Error handling
- Testing

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run prisma:generate       # Generate Prisma Client
npm run prisma:migrate        # Create and run migration
npm run prisma:migrate:deploy # Run migrations in production
npm run prisma:studio         # Open Prisma Studio
npm run prisma:seed           # Seed database (når implementeret)
```

## Projektstruktur

```
badminton/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/       # Auth routes
│   │   ├── (dashboard)/  # Protected dashboard routes
│   │   ├── api/          # API routes
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── dashboard/    # Dashboard components
│   ├── lib/
│   │   ├── auth.ts       # NextAuth config
│   │   ├── db.ts         # Prisma client
│   │   └── utils.ts      # Utility functions
│   └── types/            # TypeScript types
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Support

For spørgsmål eller problemer, kontakt udviklingsteamet.

## License

Private - Kun til intern brug i badmintonklubben.
