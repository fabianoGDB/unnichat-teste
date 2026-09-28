import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str } from '@/lib/server'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = withTenant<Ctx>(async (tenantId, req, ctx) => {
  const { id } = await ctx.params
  const body = await readBody(req)
  const name = str(body?.name)
  const phone = str(body?.phone)
  if (!name || !phone) return fail('Informe nome e telefone')
  if (phone.replace(/\D/g, '').length < 8) return fail('Telefone inválido')
  const res = await prisma.contact.updateMany({ where: { id, userId: tenantId }, data: { name, phone } })
  return res.count ? json({ ok: true }) : fail('Contato não encontrado', 404)
})

export const DELETE = withTenant<Ctx>(async (tenantId, _req, ctx) => {
  const { id } = await ctx.params
  const res = await prisma.contact.deleteMany({ where: { id, userId: tenantId } })
  return res.count ? json({ ok: true }) : fail('Contato não encontrado', 404)
})
