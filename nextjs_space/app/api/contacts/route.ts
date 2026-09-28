import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str, ownsConnection } from '@/lib/server'

export const dynamic = 'force-dynamic'

export const GET = withTenant(async (tenantId, req) => {
  const connectionId = new URL(req.url).searchParams.get('connectionId') ?? ''
  const rows = await prisma.contact.findMany({
    where: { userId: tenantId, ...(connectionId ? { connectionId } : {}) },
    orderBy: { name: 'asc' },
  })
  return json(rows)
})

export const POST = withTenant(async (tenantId, req) => {
  const body = await readBody(req)
  const name = str(body?.name)
  const phone = str(body?.phone)
  const connectionId = str(body?.connectionId)
  if (!name || !phone) return fail('Informe nome e telefone')
  if (phone.replace(/\D/g, '').length < 8) return fail('Telefone inválido')
  if (!(await ownsConnection(tenantId, connectionId))) return fail('Conexão inválida', 404)
  const row = await prisma.contact.create({ data: { name, phone, connectionId, userId: tenantId } })
  return json(row, 201)
})
