import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      player: {
        select: {
          name: true,
        },
      },
    },
  })

  console.log('\n=== Brugere i databasen ===\n')
  users.forEach(user => {
    console.log(`ID: ${user.id}`)
    console.log(`Email: ${user.email}`)
    console.log(`Navn: ${user.player?.name || 'N/A'}`)
    console.log(`Rolle: ${user.role}`)
    console.log(`Oprettet: ${user.createdAt}`)
    console.log('---')
  })

  console.log(`\nTotal: ${users.length} brugere\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
