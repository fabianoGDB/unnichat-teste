import { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Autocomplete, Checkbox, FormControlLabel, Switch, Alert, CircularProgress, Chip,
} from '@mui/material'
import type { Contact, Message } from '../types'
import { Timestamp } from 'firebase/firestore'

export type MessagePayload = { text: string; contactIds: string[]; scheduledAt: string | null }

const toLocalInput = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Props = {
  open: boolean; message: Message | null; contacts: Contact[]
  onClose: () => void; onSubmit: (payload: MessagePayload) => Promise<void>
}

export const MessageDialog = ({ open, message, contacts, onClose, onSubmit }: Props) => {
  const [selected, setSelected] = useState<Contact[]>([])
  const [text, setText] = useState('')
  const [schedule, setSchedule] = useState(false)
  const [when, setWhen] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const all = Array.isArray(contacts) ? contacts : []

  useEffect(() => {
    if (!open) return
    const ids = new Set(message?.contactIds ?? [])
    setSelected(all.filter((c) => ids.has(c.id)))
    setText(message?.text ?? '')
    const isScheduled = message?.status === 'scheduled' && !!message?.scheduledAt
    setSchedule(isScheduled)
    setWhen(
      isScheduled && message?.scheduledAt
        ? toLocalInput((message.scheduledAt as Timestamp).toDate())
        : toLocalInput(new Date(Date.now() + 600_000)),
    )
    setError('')
    setSaving(false)
  }, [open, message?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.length === 0) return setError('Selecione ao menos um contato')
    if (!text.trim()) return setError('Escreva a mensagem')
    let scheduledAt: string | null = null
    if (schedule) {
      const d = new Date(when)
      if (Number.isNaN(d.getTime())) return setError('Informe data e hora')
      if (d.getTime() <= Date.now()) return setError('Agendamento deve ser no futuro')
      scheduledAt = d.toISOString()
    }
    setSaving(true)
    try {
      await onSubmit({ text: text.trim(), contactIds: selected.map((c) => c.id), scheduledAt })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>{message ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <Autocomplete multiple disableCloseOnSelect options={all} value={selected}
              onChange={(_e, v) => setSelected(v)}
              getOptionLabel={(o) => `${o.name} — ${o.phone}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              noOptionsText="Nenhum contato"
              renderOption={(props, option, { selected: isSel }) => {
                const { key, ...rest } = props as typeof props & { key: string }
                return (
                  <li key={key} {...rest}>
                    <Checkbox size="small" checked={isSel} sx={{ mr: 1 }} />
                    {option.name} <span className="ml-1 text-xs text-gray-400">{option.phone}</span>
                  </li>
                )
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index })
                  return <Chip key={key} label={option.name} size="small" variant="outlined" {...tagProps} />
                })
              }
              renderInput={(params) => <TextField {...params} label="Contatos" size="small" />}
            />
            <Button size="small" onClick={() => setSelected(selected.length === all.length ? [] : all)} disabled={all.length === 0}>
              {selected.length === all.length ? 'Limpar seleção' : 'Selecionar todos'}
            </Button>
            <TextField label="Mensagem" multiline minRows={3} value={text}
              onChange={(e) => setText(e.target.value)} fullWidth size="small" />
            <FormControlLabel
              control={<Switch checked={schedule} onChange={(e) => setSchedule(e.target.checked)} />}
              label="Agendar envio" />
            {schedule && (
              <TextField label="Data e hora" type="datetime-local" value={when}
                onChange={(e) => setWhen(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth size="small" />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : schedule ? 'Agendar' : 'Enviar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
