'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Button, IconButton, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Chip,
} from '@mui/material'
import { Plus, Pencil, Trash2, CalendarClock, CheckCheck, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { api, useLive, formatDateTime, type Connection, type Contact, type Message } from '@/lib/client'
import { ConfirmDialog } from './dialogs'
import { MessageDialog, type MessagePayload } from './message-dialog'

type Filter = 'all' | 'sent' | 'scheduled'

export const MessagesView = ({ initialConnectionId }: { initialConnectionId: string }) => {
  const conns = useLive<Connection[]>('/api/connections')
  const connections = Array.isArray(conns.data) ? conns.data : []
  const [connectionId, setConnectionId] = useState(initialConnectionId ?? '')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Message | null | 'new'>(null)
  const [removing, setRemoving] = useState<Message | null>(null)

  useEffect(() => {
    if (connections.length > 0 && !connections.some((c) => c.id === connectionId))
      setConnectionId(connections[0]?.id ?? '')
  }, [connections, connectionId])

  const validId = connections.some((c) => c.id === connectionId) ? connectionId : ''
  const msgs = useLive<Message[]>(validId ? `/api/messages?connectionId=${validId}` : null)
  const cts = useLive<Contact[]>(validId ? `/api/contacts?connectionId=${validId}` : null)
  const contacts = Array.isArray(cts.data) ? cts.data : []
  const all = Array.isArray(msgs.data) ? msgs.data : []

  const contactMap = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts])
  const list = filter === 'all' ? all : all.filter((m) => m.status === filter)

  const save = async (payload: MessagePayload) => {
    const isNew = editing === 'new'
    if (isNew) await api('POST', '/api/messages', { ...payload, connectionId: validId })
    else await api('PATCH', `/api/messages/${(editing as Message).id}`, payload)
    toast.success(payload.scheduledAt ? 'Mensagem agendada' : 'Mensagem enviada')
    await msgs.refresh()
  }

  const remove = async () => {
    await api('DELETE', `/api/messages/${removing?.id}`)
    toast.success('Mensagem excluída')
    await msgs.refresh()
  }

  if (!conns.isLoading && connections.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400 mb-3">Crie uma conexão primeiro.</p>
        <Button component={Link} href="/dashboard" variant="contained">Ir para conexões</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-black">Mensagens</h1>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} disabled={!validId} size="small">
          Nova mensagem
        </Button>
      </div>

      <div className="mb-3 flex flex-col gap-3 rounded bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Conexão</InputLabel>
          <Select label="Conexão" value={validId} onChange={(e) => setConnectionId(String(e.target.value))}>
            {connections.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Tabs value={filter} onChange={(_e, v: Filter) => setFilter(v)}>
          <Tab value="all" icon={<Inbox size={14} />} iconPosition="start" label="Todas" />
          <Tab value="sent" icon={<CheckCheck size={14} />} iconPosition="start" label="Enviadas" />
          <Tab value="scheduled" icon={<CalendarClock size={14} />} iconPosition="start" label="Agendadas" />
        </Tabs>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Sem mensagens.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((m) => {
            const scheduled = m.status === 'scheduled'
            const names = (m.contactIds ?? []).map((id) => contactMap.get(id)?.name).filter(Boolean) as string[]
            return (
              <div key={m.id} className="rounded bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Chip
                      size="small"
                      color={scheduled ? 'warning' : 'success'}
                      label={scheduled ? 'Agendada' : 'Enviada'}
                    />
                    <span className="text-xs text-gray-500">
                      {scheduled ? formatDateTime(m.scheduledAt) : formatDateTime(m.sentAt)}
                    </span>
                  </div>
                  <div className="flex">
                    <IconButton size="small" onClick={() => setEditing(m)}><Pencil size={16} /></IconButton>
                    <IconButton size="small" onClick={() => setRemoving(m)}><Trash2 size={16} /></IconButton>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{m.text}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {names.map((n, i) => <Chip key={`${n}-${i}`} label={n} size="small" variant="outlined" />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <MessageDialog
        open={editing !== null}
        message={editing && editing !== 'new' ? editing : null}
        contacts={contacts}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog
        open={removing !== null}
        title="Excluir mensagem?"
        text="Esta mensagem será removida."
        onClose={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  )
}
