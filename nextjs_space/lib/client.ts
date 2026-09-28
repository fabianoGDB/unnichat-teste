'use client'

import useSWR from 'swr'

export type Connection = { id: string; name: string; createdAt: string }
export type Contact = { id: string; name: string; phone: string; connectionId: string }
export type Message = {
  id: string; text: string; status: 'scheduled' | 'sent'
  scheduledAt: string | null; sentAt: string | null
  contactIds: string[]; connectionId: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Erro')
  return res.json()
}

export const api = async (method: string, url: string, body?: unknown) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error ?? 'Erro')
  return data
}

// Tempo real: polling a cada 3s
export const useLive = <T,>(url: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })
  return { data, error: error as Error | undefined, isLoading, refresh: mutate }
}

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export const toLocalInput = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
