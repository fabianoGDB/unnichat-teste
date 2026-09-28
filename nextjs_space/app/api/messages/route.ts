import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str, ownsConnection } from '@/lib/server'

export const dynamic = 'force-dynamic'

export const GET = withTenant(async (tenantId, req) => {
  const sp = new URL(req.url).searchParams
  const connectionId = sp.get('connectionId') ?? ''
  const rows = await prisma.message.findMany({
    where: {
      userId: tenantId,
      ...(connectionId ? { connectionId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return json(rows)
})

// Valida e cria mensagem
export const POST = withTenant(async (tenantId, req) => {
  const body = await readBody(req)
  const connectionId = str(body?.connectionId)
  if (!(await ownsConnection(tenantId, connectionId))) return fail('Conexão inválida', 404)

  const text = str(body?.text)
  const ids = Array.isArray(body?.contactIds) ? (body.contactIds as unknown[]).map(String) : []
  const rawDate = str(body?.scheduledAt)
  if (!text) return fail('Escreva a mensagem')
  if (ids.length === 0) return fail('Selecione ao menos um contato')

  const scheduledAt = rawDate ? new Date(rawDate) : null
  const now = new Date()

  const row = await prisma.message.create({
    data: {
      text,
      contactIds: ids,
      scheduledAt,
      status: scheduledAt ? 'scheduled' : 'sent',
      sentAt: scheduledAt ? null : now,
      connectionId,
      userId: tenantId,
    },
  })
  return json(row, 201)
})
