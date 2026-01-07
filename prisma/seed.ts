import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin player
  const adminPlayer = await prisma.player.upsert({
    where: { email: 'admin@badminton.dk' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@badminton.dk',
      level: 1500,
      isActive: true,
    },
  })

  console.log('✅ Created admin player:', adminPlayer.name)

  // Create admin user
  const passwordHash = await hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@badminton.dk' },
    update: {},
    create: {
      email: 'admin@badminton.dk',
      passwordHash: passwordHash,
      role: 'ADMIN',
      playerId: adminPlayer.id,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)
  console.log('\n📧 Login credentials:')
  console.log('   Email: admin@badminton.dk')
  console.log('   Password: admin123')
  console.log('\n⚠️  Remember to change the password after first login!\n')

  // Create player statistics for admin
  await prisma.playerStatistics.upsert({
    where: { playerId: adminPlayer.id },
    update: {},
    create: {
      playerId: adminPlayer.id,
    },
  })

  console.log('✅ Created player statistics')

  // Optionally create some test players
  const testPlayers = [
    { name: 'Anders Jensen', email: 'anders@example.dk', level: 1450 },
    { name: 'Maria Hansen', email: 'maria@example.dk', level: 1550 },
    { name: 'Lars Nielsen', email: 'lars@example.dk', level: 1500 },
    { name: 'Sophie Andersen', email: 'sophie@example.dk', level: 1480 },
  ]

  for (const playerData of testPlayers) {
    const player = await prisma.player.upsert({
      where: { email: playerData.email },
      update: {},
      create: {
        ...playerData,
        isActive: true,
      },
    })

    await prisma.playerStatistics.upsert({
      where: { playerId: player.id },
      update: {},
      create: {
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
