'use client'

import { SessionProvider } from 'next-auth/react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    primary: { main: '#14b8a6', dark: '#0d9488', contrastText: '#000000' },
    secondary: { main: '#111111' },
    text: { primary: '#111111', secondary: '#555555' },
    background: { default: '#fafafa', paper: '#ffffff' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h1: { fontWeight: 700, color: '#111111' },
    h2: { fontWeight: 600, color: '#111111' },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
})

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AppRouterCacheProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  </AppRouterCacheProvider>
)
