'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@mui/material'
import { Cable, Send, LogOut } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Conexões', icon: Cable, match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/connections') },
  { href: '/dashboard/messages', label: 'Mensagens', icon: Send, match: (p: string) => p.startsWith('/dashboard/messages') },
]

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() ?? ''

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-black">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-[#5eead4]">MsgHub</span>
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                variant={item.match(pathname) ? 'contained' : 'text'}
                startIcon={<item.icon size={16} />}
                size="small"
                sx={item.match(pathname)
                  ? { bgcolor: '#14b8a6', color: '#000', '&:hover': { bgcolor: '#0d9488' } }
                  : { color: '#ccc', '&:hover': { color: '#fff' } }
                }
              >
                {item.label}
              </Button>
            ))}
            <Button size="small" onClick={() => signOut({ redirectTo: '/login' })} startIcon={<LogOut size={16} />}
              sx={{ color: '#999', '&:hover': { color: '#fff' } }}>
              Sair
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  )
}
