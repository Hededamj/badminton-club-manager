import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupPlayers() {
  try {
    console.log('🔍 Finder spillere der skal slettes...\n')

    // Find spillere UDEN holdsportId (ikke importeret fra Holdsport)
    // MEN behold Jacob Hummel og Peter Hansen
    const playersToDelete = await prisma.player.findMany({
      where: {
        holdsportId: null, // Ikke importeret fra Holdsport
        AND: {
          name: {
            notIn: ['Jacob Hummel', 'Peter Hansen'] // Behold admin brugere
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            matchPlayers: true,
          }
        }
      }
    })

    console.log(`📊 Fundet ${playersToDelete.length} spillere der IKKE er fra Holdsport:\n`)

    if (playersToDelete.length === 0) {
      console.log('✅ Ingen spillere at slette - alle spillere er enten fra Holdsport eller admin brugere!')
      return
    }

    playersToDelete.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}`)
      console.log(`   - Email: ${player.email || 'Ingen'}`)
      console.log(`   - Oprettet: ${player.createdAt.toLocaleDateString('da-DK')}`)
      console.log(`   - Kampe: ${player._count.matchPlayers}`)
      console.log('')
    })

    // Bekræftelse fra bruger (i produktion ville dette være en API call)
    console.log('\n⚠️  ADVARSEL: Denne operation sletter spillere og ALLE deres relaterede data!')
    console.log('   - MatchPlayers (kampe)')
    console.log('   - Statistics')
    console.log('   - Partnerships')
    console.log('   - Oppositions')
    console.log('   - TrainingPlayers')
    console.log('')
    console.log('💡 Jacob Hummel og Peter Hansen beholdes som admin brugere')
    console.log('💡 Alle spillere med holdsportId beholdes')
    console.log('')

    // Prompt for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    readline.question('Vil du fortsætte med sletningen? (skriv "SLET" for at bekræfte): ', async (answer: string) => {
      if (answer === 'SLET') {
        console.log('\n🗑️  Sletter spillere...\n')

        const playerIds = playersToDelete.map(p => p.id)

        // Slet relaterede data først (hvis ikke cascade)
        await prisma.matchPlayer.deleteMany({
          where: { playerId: { in: playerIds } }
        })
        console.log('✅ Slettet matchPlayers')

        await prisma.playerStatistics.deleteMany({
          where: { playerId: { in: playerIds } }
        })
        console.log('✅ Slettet statistics')

        await prisma.partnership.deleteMany({
          where: {
            OR: [
              { player1Id: { in: playerIds } },
              { player2Id: { in: playerIds } }
            ]
          }
        })
        console.log('✅ Slettet partnerships')

        await prisma.opposition.deleteMany({
          where: {
            OR: [
              { player1Id: { in: playerIds } },
              { player2Id: { in: playerIds } }
            ]
          }
        })
        console.log('✅ Slettet oppositions')

        await prisma.trainingPlayer.deleteMany({
          where: { playerId: { in: playerIds } }
        })
        console.log('✅ Slettet trainingPlayers')

        await prisma.teamPlayer.deleteMany({
          where: { playerId: { in: playerIds } }
        })
        console.log('✅ Slettet teamPlayers')

        // Slet spillerne
        const result = await prisma.player.deleteMany({
          where: { id: { in: playerIds } }
        })

        console.log(`\n✅ Slettet ${result.count} spillere!`)
        console.log('\n📊 Oversigt over tilbageværende spillere:')

        const remainingPlayers = await prisma.player.findMany({
          select: {
            name: true,
            holdsportId: true,
            email: true,
          }
        })

        console.log(`\nAntal spillere tilbage: ${remainingPlayers.length}\n`)
        remainingPlayers.forEach(p => {
          const source = p.holdsportId ? '(Holdsport)' : '(Admin bruger)'
          console.log(`- ${p.name} ${source}`)
        })

      } else {
        console.log('\n❌ Sletning afbrudt - ingen ændringer lavet')
      }

      readline.close()
      await prisma.$disconnect()
    })

  } catch (error) {
    console.error('❌ Fejl:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

cleanupPlayers()
