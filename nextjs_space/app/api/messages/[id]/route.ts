import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str } from '@/lib/server'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = withTenant<Ctx>(async (tenantId, req, ctx) => {
  const { id } = await ctx.params
  const current = await prisma.message.findFirst({ where: { id, userId: tenantId } })
  if (!current) return fail('Mensagem não encontrada', 404)

  const body = await readBody(req)
  const text = str(body?.text)
  const ids = Array.isArray(body?.contactIds) ? (body.contactIds as unknown[]).map(String) : []
  const rawDate = str(body?.scheduledAt)
  if (!text) return fail('Escreva a mensagem')
  if (ids.length === 0) return fail('Selecione ao menos um contato')

  const scheduledAt = rawDate ? new Date(rawDate) : null
  const now = new Date()

  const row = await prisma.message.update({
    where: { id },
    data: {
      text,
      contactIds: ids,
      scheduledAt,
      status: scheduledAt ? 'scheduled' : 'sent',
      sentAt: scheduledAt ? null : now,
    },
  })
  return json(row)
})

export const DELETE = withTenant<Ctx>(async (tenantId, _req, ctx) => {
  const { id } = await ctx.params
  const res = await prisma.message.deleteMany({ where: { id, userId: tenantId } })
  return res.count ? json({ ok: true }) : fail('Mensagem não encontrada', 404)
})
