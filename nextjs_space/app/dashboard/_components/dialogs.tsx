'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Alert } from '@mui/material'

export type Field = { key: string; label: string; type?: string }

type FormDialogProps = {
  open: boolean
  title: string
  fields: Field[]
  initial: Record<string, string>
  onClose: () => void
  onSubmit: (values: Record<string, string>) => Promise<void>
}

export const FormDialog = ({ open, title, fields, initial, onClose, onSubmit }: FormDialogProps) => {
  const [values, setValues] = useState<Record<string, string>>(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setValues(initial); setError(''); setSaving(false) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = fields.find((f) => !values[f.key]?.trim())
    if (missing) return setError(`Preencha "${missing.label}"`)
    setSaving(true)
    try { await onSubmit(values); onClose() } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            {fields.map((f, i) => (
              <TextField
                key={f.key}
                label={f.label}
                type={f.type ?? 'text'}
                autoFocus={i === 0}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                fullWidth
                size="small"
              />
            ))}
            {error && <Alert severity="error">{error}</Alert>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

type ConfirmProps = { open: boolean; title: string; text: string; onClose: () => void; onConfirm: () => Promise<void> }

export const ConfirmDialog = ({ open, title, text, onClose, onConfirm }: ConfirmProps) => {
  const [busy, setBusy] = useState(false)
  const confirm = async () => {
    setBusy(true)
    try { await onConfirm(); onClose() } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent><p className="text-sm text-gray-500">{text}</p></DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancelar</Button>
        <Button onClick={confirm} disabled={busy} variant="contained" color="error">
          {busy ? <CircularProgress size={20} color="inherit" /> : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
