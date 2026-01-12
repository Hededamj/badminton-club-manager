import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Get or create default club
  let club = await prisma.club.findFirst({
    where: { slug: 'htk-badminton' },
  })

  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'HTK Badminton',
        slug: 'htk-badminton',
        description: 'Default badminton club',
        isActive: true,
      },
    })
    console.log('✅ Created default club:', club.name)
  }

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@badminton.dk' },
  })

  let adminPlayer

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists')
    // Find admin player by membership
    const membership = await prisma.clubMembership.findFirst({
      where: { userId: existingAdmin.id, clubId: club.id },
      include: { player: true },
    })
    adminPlayer = membership?.player
  } else {
    // Create admin player
    adminPlayer = await prisma.player.create({
      data: {
        clubId: club.id,
        name: 'Admin',
        email: 'admin@badminton.dk',
        level: 1500,
        isActive: true,
      },
    })

    console.log('✅ Created admin player:', adminPlayer.name)

    // Create admin user
    const passwordHash = await hash('Plantagevej12_', 10)

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@badminton.dk',
        passwordHash: passwordHash,
        role: 'ADMIN',
      },
    })

    // Create club membership
    await prisma.clubMembership.create({
      data: {
        userId: adminUser.id,
        clubId: club.id,
        role: 'OWNER',
        playerId: adminPlayer.id,
        isActive: true,
      },
    })

    console.log('✅ Created admin user:', adminUser.email)
    console.log('\n📧 Login credentials:')
    console.log('   Email: admin@badminton.dk')
    console.log('   Password: Plantagevej12_')
    console.log('\n⚠️  Remember to change the password after first login!\n')

    // Create player statistics for admin
    await prisma.playerStatistics.create({
      data: {
        playerId: adminPlayer.id,
      },
    })

    console.log('✅ Created player statistics')
  }

  // Create test players (only if they don't exist)
  const testPlayers = [
    { name: 'Anders Jensen', email: 'anders@example.dk', level: 1450 },
    { name: 'Maria Hansen', email: 'maria@example.dk', level: 1550 },
    { name: 'Lars Nielsen', email: 'lars@example.dk', level: 1500 },
    { name: 'Sophie Andersen', email: 'sophie@example.dk', level: 1480 },
  ]

  for (const playerData of testPlayers) {
    // Check if player already exists (using composite unique key)
    const existing = await prisma.player.findFirst({
      where: { clubId: club.id, email: playerData.email },
    })

    if (existing) {
      console.log(`ℹ️  ${playerData.name} already exists, skipping`)
      continue
    }

    const player = await prisma.player.create({
      data: {
        clubId: club.id,
        ...playerData,
        isActive: true,
      },
    })

    await prisma.playerStatistics.create({
      data: {
        playerId: player.id,
      },
    })

    console.log('✅ Created test player:', player.name)
  }

  console.log('\n✨ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
