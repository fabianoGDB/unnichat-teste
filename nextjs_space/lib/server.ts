import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status })
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })

export const getTenantId = async (): Promise<string | null> => {
  const session = await auth()
  return session?.user?.id ?? null
}

// Wrapper que exige autenticação e injeta o tenantId
export const withTenant =
  <C,>(handler: (tenantId: string, req: Request, ctx: C) => Promise<Response>) =>
  async (req: Request, ctx: C): Promise<Response> => {
    try {
      const tenantId = await getTenantId()
      if (!tenantId) return fail('Não autenticado', 401)
      return await handler(tenantId, req, ctx)
    } catch (e) {
      console.error(e)
      return fail('Erro interno', 500)
    }
  }

export const readBody = async (req: Request): Promise<Record<string, unknown>> => {
  try {
    const b = await req.json()
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

export const ownsConnection = async (tenantId: string, connectionId: string): Promise<boolean> =>
  !!connectionId && (await prisma.connection.count({ where: { id: connectionId, userId: tenantId } })) > 0

// "Função agendada": muda mensagens agendadas vencidas para enviadas
export const processDueMessages = async (): Promise<number> => {
  const now = new Date()
  const res = await prisma.message.updateMany({
    where: { status: 'scheduled', scheduledAt: { lte: now } },
    data: { status: 'sent', sentAt: now },
  })
  return res?.count ?? 0
}
