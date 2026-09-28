import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch, Timestamp } from 'firebase/firestore'
import { Button, IconButton } from '@mui/material'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useFirestore } from '../hooks/useFirestore'
import { FormDialog, ConfirmDialog } from '../components/Dialogs'
import type { Connection } from '../types'

export const Connections = () => {
  const { user } = useAuth()
  const uid = user!.uid
  const q = useMemo(() => query(collection(db, 'connections'), where('userId', '==', uid)), [uid])
  const { data: list } = useFirestore<Connection>(q, `conn-${uid}`)
  const [editing, setEditing] = useState<Connection | null | 'new'>(null)
  const [removing, setRemoving] = useState<Connection | null>(null)

  const save = async (values: Record<string, string>) => {
    if (editing === 'new') {
      await addDoc(collection(db, 'connections'), { userId: uid, name: values.name, createdAt: Timestamp.now() })
      toast.success('Conexão criada')
    } else {
      await updateDoc(doc(db, 'connections', (editing as Connection).id), { name: values.name })
      toast.success('Conexão atualizada')
    }
  }

  const remove = async () => {
    const id = removing!.id
    const batch = writeBatch(db)
    const contactsSnap = await getDocs(query(collection(db, 'contacts'), where('connectionId', '==', id)))
    const messagesSnap = await getDocs(query(collection(db, 'messages'), where('connectionId', '==', id)))
    contactsSnap.docs.forEach((d) => batch.delete(d.ref))
    messagesSnap.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(doc(db, 'connections', id))
    await batch.commit()
    toast.success('Conexão excluída')
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Conexões</h1>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setEditing('new')} size="small">Nova conexão</Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Nenhuma conexão ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded bg-white p-3 shadow-sm">
              <Link to={`/connections/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
              <div className="flex gap-1">
                <IconButton size="small" onClick={() => setEditing(c)}><Pencil size={16} /></IconButton>
                <IconButton size="small" onClick={() => setRemoving(c)}><Trash2 size={16} /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormDialog open={editing !== null} title={editing === 'new' ? 'Nova conexão' : 'Editar conexão'}
        fields={[{ key: 'name', label: 'Nome da conexão' }]}
        initial={{ name: editing && editing !== 'new' ? editing.name : '' }}
        onClose={() => setEditing(null)} onSubmit={save} />
      <ConfirmDialog open={removing !== null} title="Excluir conexão?"
        text={`"${removing?.name ?? ''}" e seus contatos/mensagens serão removidos.`}
        onClose={() => setRemoving(null)} onConfirm={remove} />
    </div>
  )
}
