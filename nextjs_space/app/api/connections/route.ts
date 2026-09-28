import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str } from '@/lib/server'

export const dynamic = 'force-dynamic'

export const GET = withTenant(async (tenantId) => {
  const rows = await prisma.connection.findMany({
    where: { userId: tenantId },
    orderBy: { createdAt: 'desc' },
  })
  return json(rows)
})

export const POST = withTenant(async (tenantId, req) => {
  const name = str((await readBody(req))?.name)
  if (!name) return fail('Informe o nome da conexão')
  const row = await prisma.connection.create({ data: { name, userId: tenantId } })
  return json(row, 201)
})
