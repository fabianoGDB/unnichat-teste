import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { Button, TextField, Alert, CircularProgress, Tabs, Tab } from '@mui/material'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'

export const Login = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (authLoading) return null
  if (user) return <Navigate to="/" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 0) await signInWithEmailAndPassword(auth, email, password)
      else await createUserWithEmailAndPassword(auth, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-8 rounded shadow-sm">
        <h1 className="text-2xl font-bold text-center text-black mb-1">MsgHub</h1>
        <p className="text-sm text-gray-400 text-center mb-6">{tab === 0 ? 'Entrar' : 'Criar conta'}</p>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} centered sx={{ mb: 3 }}>
          <Tab label="Entrar" />
          <Tab label="Criar conta" />
        </Tabs>
        <div className="flex flex-col gap-3">
          <TextField label="E-mail" type="email" size="small" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Senha" type="password" size="small" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} inputProps={{ minLength: 6 }} />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : tab === 0 ? 'Entrar' : 'Criar conta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
