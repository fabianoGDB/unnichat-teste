import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore'
import {
  Button, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Chip,
  IconButton,
} from '@mui/material'
import { Plus, Pencil, Trash2, CalendarClock, CheckCheck, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFirestore } from '../hooks/useFirestore'
import { ConfirmDialog } from '../components/Dialogs'
import { MessageDialog, type MessagePayload } from '../components/MessageDialog'
import type { Connection, Contact, Message } from '../types'

type Filter = 'all' | 'sent' | 'scheduled'

const fmt = (ts: Timestamp | null | undefined): string => {
  if (!ts) return '—'
  return ts.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export const Messages = () => {
  const { user } = useAuth()
  const uid = user!.uid

  // Conexões
  const connQ = useMemo(() => query(collection(db, 'connections'), where('userId', '==', uid)), [uid])
  const { data: connections } = useFirestore<Connection>(connQ, `conn-${uid}`)
  const [connectionId, setConnectionId] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Message | null | 'new'>(null)
  const [removing, setRemoving] = useState<Message | null>(null)

  useEffect(() => {
    if (connections.length > 0 && !connections.some((c) => c.id === connectionId))
      setConnectionId(connections[0]?.id ?? '')
  }, [connections, connectionId])

  const validId = connections.some((c) => c.id === connectionId) ? connectionId : ''

  // Mensagens e contatos da conexão selecionada
  const msgQ = useMemo(
    () => validId ? query(collection(db, 'messages'), where('userId', '==', uid), where('connectionId', '==', validId)) : null,
    [uid, validId],
  )
  const ctQ = useMemo(
    () => validId ? query(collection(db, 'contacts'), where('userId', '==', uid), where('connectionId', '==', validId)) : null,
    [uid, validId],
  )
  const { data: allMsgs } = useFirestore<Message>(msgQ, `msg-${uid}-${validId}`)
  const { data: contacts } = useFirestore<Contact>(ctQ, `ct-${uid}-${validId}`)

  const contactMap = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts])
  const list = filter === 'all' ? allMsgs : allMsgs.filter((m) => m.status === filter)

  const save = async (payload: MessagePayload) => {
    const status = payload.scheduledAt ? 'scheduled' : 'sent'
    const base = {
      userId: uid,
      connectionId: validId,
      contactIds: payload.contactIds,
      text: payload.text,
      status,
      scheduledAt: payload.scheduledAt ? Timestamp.fromDate(new Date(payload.scheduledAt)) : null,
      sentAt: status === 'sent' ? Timestamp.now() : null,
    }
    if (editing === 'new') {
      await addDoc(collection(db, 'messages'), { ...base, createdAt: Timestamp.now() })
    } else {
      await updateDoc(doc(db, 'messages', (editing as Message).id), base)
    }
    toast.success(payload.scheduledAt ? 'Mensagem agendada' : 'Mensagem enviada')
  }

  const remove = async () => {
    await deleteDoc(doc(db, 'messages', removing!.id))
    toast.success('Mensagem excluída')
  }

  if (connections.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400 mb-3">Crie uma conexão primeiro.</p>
        <Button component={Link} to="/connections" variant="contained">Ir para conexões</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Mensagens</h1>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} disabled={!validId} size="small">Nova mensagem</Button>
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
                    <Chip size="small" color={scheduled ? 'warning' : 'success'} label={scheduled ? 'Agendada' : 'Enviada'} />
                    <span className="text-xs text-gray-500">{scheduled ? fmt(m.scheduledAt) : fmt(m.sentAt)}</span>
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

      <MessageDialog open={editing !== null} message={editing && editing !== 'new' ? editing : null}
        contacts={contacts} onClose={() => setEditing(null)} onSubmit={save} />
      <ConfirmDialog open={removing !== null} title="Excluir mensagem?" text="Esta mensagem será removida."
        onClose={() => setRemoving(null)} onConfirm={remove} />
    </div>
  )
}
