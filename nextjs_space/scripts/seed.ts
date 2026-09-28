import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const main = async (): Promise<void> => {
  const password = await bcrypt.hash('hKRH#czyL5', 10)
  await prisma.user.upsert({
    where: { email: 'abacus-42bee0cc@example.com' },
    update: {},
    create: { email: 'abacus-42bee0cc@example.com', name: 'Admin', password, role: 'admin' },
  })
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
