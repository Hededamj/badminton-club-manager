import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking admin user...\n')

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@badminton.dk' },
    include: { player: true }
  })

  if (!adminUser) {
    console.log('❌ No admin user found!')
    return
  }

  console.log('✅ Admin user exists:')
  console.log('   Email:', adminUser.email)
  console.log('   Role:', adminUser.role)
  console.log('   Player:', adminUser.player?.name)
  console.log('   Password hash:', adminUser.passwordHash.substring(0, 20) + '...')

  // Test password
  const testPassword = 'Plantagevej12_'
  const isValid = await compare(testPassword, adminUser.passwordHash)

  console.log('\n🔐 Password test:')
  console.log('   Testing password: Plantagevej12_')
  console.log('   Result:', isValid ? '✅ CORRECT' : '❌ WRONG')

  if (!isValid) {
    console.log('\n⚠️  Password does not match! Resetting now...')
    const bcrypt = await import('bcryptjs')
    const newHash = await bcrypt.hash('Plantagevej12_', 10)

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: newHash }
    })

    console.log('✅ Password reset complete!')
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
