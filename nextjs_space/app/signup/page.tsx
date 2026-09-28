import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignupPage() {
  const session = await auth()
  if (session?.user?.id) redirect('/dashboard')
  return <AuthForm mode="signup" />
}
