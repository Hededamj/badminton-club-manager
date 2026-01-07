import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  console.log('🔄 Resetting admin password...')

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@badminton.dk' },
  })

  if (!admin) {
    console.error('❌ Admin user not found')
    process.exit(1)
  }

  const newPassword = 'Plantagevej12_'
  const passwordHash = await hash(newPassword, 10)

  await prisma.user.update({
    where: { email: 'admin@badminton.dk' },
    data: { passwordHash },
  })

  console.log('✅ Admin password has been reset')
  console.log('\n📧 Login credentials:')
  console.log('   Email: admin@badminton.dk')
  console.log('   Password: Plantagevej12_')
  console.log('')

  await prisma.$disconnect()
}

resetAdminPassword().catch((e) => {
  console.error('❌ Failed to reset password:', e)
  process.exit(1)
})
