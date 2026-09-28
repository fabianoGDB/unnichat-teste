import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore'
import { Button, IconButton } from '@mui/material'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFirestore } from '../hooks/useFirestore'
import { FormDialog, ConfirmDialog } from '../components/Dialogs'
import type { Contact, Connection } from '../types'

export const Contacts = () => {
  const { id: connectionId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const uid = user!.uid
  const [connName, setConnName] = useState('')

  useEffect(() => {
    if (!connectionId) return
    getDoc(doc(db, 'connections', connectionId)).then((snap) => {
      if (snap.exists()) setConnName((snap.data() as Connection).name)
    })
  }, [connectionId])

  const q = useMemo(
    () => connectionId ? query(collection(db, 'contacts'), where('userId', '==', uid), where('connectionId', '==', connectionId)) : null,
    [uid, connectionId],
  )
  const { data: list } = useFirestore<Contact>(q, `cts-${uid}-${connectionId}`)
  const [editing, setEditing] = useState<Contact | null | 'new'>(null)
  const [removing, setRemoving] = useState<Contact | null>(null)

  const save = async (values: Record<string, string>) => {
    if (editing === 'new') {
      await addDoc(collection(db, 'contacts'), { userId: uid, connectionId, name: values.name, phone: values.phone, createdAt: Timestamp.now() })
      toast.success('Contato criado')
    } else {
      await updateDoc(doc(db, 'contacts', (editing as Contact).id), { name: values.name, phone: values.phone })
      toast.success('Contato atualizado')
    }
  }

  const remove = async () => {
    await deleteDoc(doc(db, 'contacts', removing!.id))
    toast.success('Contato excluído')
  }

  return (
    <div>
      <Button component={Link} to="/connections" size="small" startIcon={<ArrowLeft size={16} />} sx={{ mb: 1 }}>Voltar</Button>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contatos</h1>
          <p className="text-sm text-gray-500">Conexão: {connName || '…'}</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} size="small">Novo contato</Button>
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

      <FormDialog open={editing !== null} title={editing === 'new' ? 'Novo contato' : 'Editar contato'}
        fields={[{ key: 'name', label: 'Nome' }, { key: 'phone', label: 'Telefone', type: 'tel' }]}
        initial={editing && editing !== 'new' ? { name: editing.name, phone: editing.phone } : { name: '', phone: '' }}
        onClose={() => setEditing(null)} onSubmit={save} />
      <ConfirmDialog open={removing !== null} title="Excluir contato?"
        text={`"${removing?.name ?? ''}" será removido.`}
        onClose={() => setRemoving(null)} onConfirm={remove} />
    </div>
  )
}
