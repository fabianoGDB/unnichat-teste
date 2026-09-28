import { prisma } from '@/lib/db'
import { withTenant, json, fail, readBody, str } from '@/lib/server'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export const GET = withTenant<Ctx>(async (tenantId, _req, ctx) => {
  const { id } = await ctx.params
  const row = await prisma.connection.findFirst({ where: { id, userId: tenantId } })
  return row ? json(row) : fail('Conexão não encontrada', 404)
})

export const PATCH = withTenant<Ctx>(async (tenantId, req, ctx) => {
  const { id } = await ctx.params
  const name = str((await readBody(req))?.name)
  if (!name) return fail('Informe o nome da conexão')
  const res = await prisma.connection.updateMany({ where: { id, userId: tenantId }, data: { name } })
  return res.count ? json({ ok: true }) : fail('Conexão não encontrada', 404)
})

export const DELETE = withTenant<Ctx>(async (tenantId, _req, ctx) => {
  const { id } = await ctx.params
  const res = await prisma.connection.deleteMany({ where: { id, userId: tenantId } })
  return res.count ? json({ ok: true }) : fail('Conexão não encontrada', 404)
})
