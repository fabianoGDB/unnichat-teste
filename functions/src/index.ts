import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()

// Roda a cada minuto: mensagens "scheduled" com scheduledAt <= agora passam para "sent"
export const processScheduledMessages = onSchedule('every 1 minutes', async () => {
  const now = Timestamp.now()
  const due = await db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .limit(450)
    .get()
  if (due.empty) return
  const batch = db.batch()
  due.docs.forEach((doc) => batch.update(doc.ref, { status: 'sent', sentAt: now }))
  await batch.commit()
  console.log(`${due.size} mensagem(ns) marcada(s) como enviada(s)`)
})
