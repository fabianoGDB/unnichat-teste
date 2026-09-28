import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'MsgHub',
  description: 'Plataforma de mensagens agendadas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <ChunkLoadErrorHandler />
        </Providers>
      </body>
    </html>
  )
}
