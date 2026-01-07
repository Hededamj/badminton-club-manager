import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking players in database...\n')

  const players = await prisma.player.findMany({
    include: {
      statistics: true,
    },
    orderBy: [
      { isActive: 'desc' },
      { level: 'desc' },
    ],
  })

  console.log(`Found ${players.length} players:\n`)

  for (const player of players) {
    console.log(`- ${player.name}`)
    console.log(`  Email: ${player.email || 'N/A'}`)
    console.log(`  Level: ${player.level}`)
    console.log(`  Active: ${player.isActive}`)
    console.log(`  Stats: ${player.statistics?.totalMatches || 0} matches, ${player.statistics?.wins || 0} wins`)
    console.log('')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
