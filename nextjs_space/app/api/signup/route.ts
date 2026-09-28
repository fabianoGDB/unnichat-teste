import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const POST = async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const name = String(body?.name ?? body?.fullName ?? '').trim()
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres' }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
    const user = await prisma.user.create({
      data: { email, name: name || email.split('@')[0], password: await bcrypt.hash(password, 10) },
    })
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
