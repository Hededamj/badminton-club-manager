import { db as prisma } from '../src/lib/db'

async function checkDuplicates() {
  console.log('Checking for duplicate players...\n')

  // Find all players
  const players = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      holdsportId: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  })

  console.log(`Total players: ${players.length}\n`)

  // Check for duplicate names
  const nameMap = new Map<string, typeof players>()

  for (const player of players) {
    const existing = nameMap.get(player.name)
    if (existing) {
      existing.push(player)
    } else {
      nameMap.set(player.name, [player])
    }
  }

  const duplicates = Array.from(nameMap.entries()).filter(([_, ps]) => ps.length > 1)

  if (duplicates.length === 0) {
    console.log('✓ No duplicate names found')
    return
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate names:\n`)

  for (const [name, ps] of duplicates) {
    console.log(`Name: ${name}`)
    for (const p of ps) {
      console.log(`  - ID: ${p.id}`)
      console.log(`    Email: ${p.email || 'N/A'}`)
      console.log(`    Holdsport ID: ${p.holdsportId || 'N/A'}`)
      console.log(`    Active: ${p.isActive}`)
    }
    console.log('')
  }

  // Check for duplicate holdsportIds
  const holdsportMap = new Map<string, typeof players>()

  for (const player of players) {
    if (!player.holdsportId) continue
    const existing = holdsportMap.get(player.holdsportId)
    if (existing) {
      existing.push(player)
    } else {
      holdsportMap.set(player.holdsportId, [player])
    }
  }

  const holdsportDuplicates = Array.from(holdsportMap.entries()).filter(
    ([_, ps]) => ps.length > 1
  )

  if (holdsportDuplicates.length > 0) {
    console.log(`\n⚠️  Found ${holdsportDuplicates.length} duplicate Holdsport IDs:\n`)

    for (const [holdsportId, ps] of holdsportDuplicates) {
      console.log(`Holdsport ID: ${holdsportId}`)
      for (const p of ps) {
        console.log(`  - ID: ${p.id}, Name: ${p.name}`)
      }
      console.log('')
    }
  }
}

checkDuplicates()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
