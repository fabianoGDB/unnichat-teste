import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from './hooks/useAuth'
import { Login } from './pages/Login'
import { Connections } from './pages/Connections'
import { Contacts } from './pages/Contacts'
import { Messages } from './pages/Messages'
import { AppShell } from './components/AppShell'

const Private = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Private><AppShell /></Private>}>
      <Route index element={<Navigate to="/connections" replace />} />
      <Route path="connections" element={<Connections />} />
      <Route path="connections/:id" element={<Contacts />} />
      <Route path="messages" element={<Messages />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
