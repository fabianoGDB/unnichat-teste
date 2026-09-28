import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppShell } from './_components/app-shell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return <AppShell>{children}</AppShell>
}
