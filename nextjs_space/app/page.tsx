import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

// Redireciona direto: logado → dashboard, deslogado → login
export default async function Home() {
  const session = await auth()
  redirect(session?.user?.id ? '/dashboard' : '/login')
}
