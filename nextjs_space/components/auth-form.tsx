'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { TextField, Button, Alert, CircularProgress } from '@mui/material'

export const AuthForm = ({ mode }: { mode: 'login' | 'signup' }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignup = mode === 'signup'

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error ?? 'Erro ao criar conta')
      }
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.error) throw new Error('E-mail ou senha inválidos')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm rounded bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-black mb-1">MsgHub</h1>
        <p className="text-sm text-gray-400 mb-8">
          {isSignup ? 'Criar conta' : 'Entrar'}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {isSignup && (
            <TextField label="Nome" value={form.name} onChange={update('name')} fullWidth size="small" />
          )}
          <TextField label="E-mail" type="email" required value={form.email} onChange={update('email')} fullWidth size="small" />
          <TextField label="Senha" type="password" required value={form.password} onChange={update('password')} fullWidth size="small" />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#14b8a6', color: '#000', '&:hover': { bgcolor: '#0d9488' } }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : isSignup ? 'Cadastrar' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          {isSignup ? 'Já tem conta? ' : 'Sem conta? '}
          <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-black hover:underline">
            {isSignup ? 'Entrar' : 'Criar'}
          </Link>
        </p>
      </div>
    </main>
  )
}
