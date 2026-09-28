'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, IconButton } from '@mui/material'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { api, useLive, type Connection, type Contact } from '@/lib/client'
import { FormDialog, ConfirmDialog } from './dialogs'

export const ContactsView = ({ connectionId }: { connectionId: string }) => {
  const conn = useLive<Connection>(`/api/connections/${connectionId}`)
  const { data, refresh } = useLive<Contact[]>(`/api/contacts?connectionId=${connectionId}`)
  const [editing, setEditing] = useState<Contact | null | 'new'>(null)
  const [removing, setRemoving] = useState<Contact | null>(null)
  const list = Array.isArray(data) ? data : []

  const save = async (values: Record<string, string>) => {
    const isNew = editing === 'new'
    const payload = { name: values.name, phone: values.phone, connectionId }
    if (isNew) await api('POST', '/api/contacts', payload)
    else await api('PATCH', `/api/contacts/${(editing as Contact).id}`, payload)
    toast.success(isNew ? 'Contato criado' : 'Contato atualizado')
    await refresh()
  }

  const remove = async () => {
    await api('DELETE', `/api/contacts/${removing?.id}`)
    toast.success('Contato excluído')
    await refresh()
  }

  return (
    <div>
      <Button component={Link} href="/dashboard" size="small" startIcon={<ArrowLeft size={16} />} sx={{ mb: 1 }}>
        Voltar
      </Button>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-black">Contatos</h1>
          <p className="text-sm text-gray-400">{conn.data?.name ?? '…'}</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} size="small">
          Novo contato
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Sem contatos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded bg-white p-3 shadow-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">{c.phone}</p>
              </div>
              <div className="flex gap-1">
                <IconButton size="small" onClick={() => setEditing(c)}><Pencil size={16} /></IconButton>
                <IconButton size="small" onClick={() => setRemoving(c)}><Trash2 size={16} /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDialog
        open={editing !== null}
        title={editing === 'new' ? 'Novo contato' : 'Editar contato'}
        fields={[
          { key: 'name', label: 'Nome' },
          { key: 'phone', label: 'Telefone', type: 'tel' },
        ]}
        initial={editing && editing !== 'new' ? { name: editing.name, phone: editing.phone } : { name: '', phone: '' }}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog
        open={removing !== null}
        title="Excluir contato?"
        text={`"${removing?.name ?? ''}" será removido.`}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  )
}
