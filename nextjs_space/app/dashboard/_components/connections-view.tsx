'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, IconButton } from '@mui/material'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api, useLive, type Connection } from '@/lib/client'
import { FormDialog, ConfirmDialog } from './dialogs'

export const ConnectionsView = () => {
  const { data, refresh } = useLive<Connection[]>('/api/connections')
  const [editing, setEditing] = useState<Connection | null | 'new'>(null)
  const [removing, setRemoving] = useState<Connection | null>(null)
  const list = Array.isArray(data) ? data : []

  const save = async (values: Record<string, string>) => {
    const isNew = editing === 'new'
    if (isNew) await api('POST', '/api/connections', { name: values.name })
    else await api('PATCH', `/api/connections/${(editing as Connection).id}`, { name: values.name })
    toast.success(isNew ? 'Conexão criada' : 'Conexão atualizada')
    await refresh()
  }

  const remove = async () => {
    await api('DELETE', `/api/connections/${removing?.id}`)
    toast.success('Conexão excluída')
    await refresh()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-black">Conexões</h1>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} size="small">
          Nova conexão
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Nenhuma conexão ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded bg-white p-3 shadow-sm">
              <Link href={`/dashboard/connections/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
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
        title={editing === 'new' ? 'Nova conexão' : 'Editar conexão'}
        fields={[{ key: 'name', label: 'Nome da conexão' }]}
        initial={{ name: editing && editing !== 'new' ? editing.name : '' }}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog
        open={removing !== null}
        title="Excluir conexão?"
        text={`"${removing?.name ?? ''}" e seus contatos/mensagens serão removidos.`}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
      />
    </div>
  )
}
