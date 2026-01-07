import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking for admin user...')

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@badminton.dk' },
    include: { player: true }
  })

  if (!adminUser) {
    console.log('❌ No admin user found!')
    console.log('Run: npm run prisma:seed')
    process.exit(1)
  }

  console.log('✅ Admin user found:', adminUser.email)
  console.log('   Player name:', adminUser.player?.name)
  console.log('   Role:', adminUser.role)

  // Reset password
  const newPassword = 'Plantagevej12_'
  const passwordHash = await hash(newPassword, 10)

  await prisma.user.update({
    where: { id: adminUser.id },
    data: { passwordHash }
  })

  console.log('\n✅ Password reset successfully!')
  console.log('📧 Login credentials:')
  console.log('   Email: admin@badminton.dk')
  console.log('   Password: Plantagevej12_')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
