/**
 * Migration script: Single-tenant to Multi-tenant
 *
 * This script:
 * 1. Creates a default club for existing data
 * 2. Creates ClubMembership for all existing users
 * 3. Sets clubId on all existing players, trainings, and tournaments
 *
 * Run with: npx tsx scripts/migrate-to-multi-tenant.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('Starting multi-tenant migration...\n')

  // Check if migration already ran (look for existing clubs)
  const existingClubs = await prisma.club.count()
  if (existingClubs > 0) {
    console.log('⚠️  Clubs already exist. Migration may have already run.')
    console.log(`   Found ${existingClubs} existing club(s).`)

    const response = await new Promise<string>((resolve) => {
      process.stdout.write('Continue anyway? (y/N): ')
      process.stdin.once('data', (data) => resolve(data.toString().trim().toLowerCase()))
    })

    if (response !== 'y') {
      console.log('Migration cancelled.')
      process.exit(0)
    }
  }

  // 1. Create default club
  console.log('1. Creating default club...')

  const defaultClub = await prisma.club.create({
    data: {
      name: 'HTK Badminton',
      slug: 'htk-badminton',
      description: 'Migreret fra single-tenant system',
      isActive: true,
    }
  })

  console.log(`   ✓ Created club: ${defaultClub.name} (${defaultClub.id})`)

  // 2. Get all users and create memberships
  console.log('\n2. Creating club memberships for users...')

  const users = await prisma.user.findMany({
    include: { player: true }
  })

  console.log(`   Found ${users.length} user(s)`)

  for (const user of users) {
    // Determine role based on current UserRole
    const clubRole = user.role === 'ADMIN' ? 'OWNER' : 'MEMBER'

    await prisma.clubMembership.create({
      data: {
        userId: user.id,
        clubId: defaultClub.id,
        role: clubRole,
        playerId: user.playerId,
        isActive: true,
      }
    })

    console.log(`   ✓ ${user.email} → ${clubRole}${user.playerId ? ' (linked to player)' : ''}`)
  }

  // 3. Update all players with clubId
  console.log('\n3. Updating players with clubId...')

  const playersUpdated = await prisma.player.updateMany({
    where: { clubId: null },
    data: { clubId: defaultClub.id }
  })

  console.log(`   ✓ Updated ${playersUpdated.count} player(s)`)

  // 4. Update all trainings with clubId
  console.log('\n4. Updating trainings with clubId...')

  const trainingsUpdated = await prisma.training.updateMany({
    where: { clubId: null },
    data: { clubId: defaultClub.id }
  })

  console.log(`   ✓ Updated ${trainingsUpdated.count} training(s)`)

  // 5. Update all tournaments with clubId
  console.log('\n5. Updating tournaments with clubId...')

  const tournamentsUpdated = await prisma.tournament.updateMany({
    where: { clubId: null },
    data: { clubId: defaultClub.id }
  })

  console.log(`   ✓ Updated ${tournamentsUpdated.count} tournament(s)`)

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('Migration complete!')
  console.log('='.repeat(50))
  console.log(`
Summary:
  - Club created: ${defaultClub.name}
  - Users migrated: ${users.length}
  - Players updated: ${playersUpdated.count}
  - Trainings updated: ${trainingsUpdated.count}
  - Tournaments updated: ${tournamentsUpdated.count}

Next steps:
  1. Verify data in the database
  2. Update auth.ts to include club in session
  3. Update API routes to filter by clubId
  4. Make clubId required in schema (run another migration)
`)
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
