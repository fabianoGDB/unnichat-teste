import { Timestamp } from 'firebase/firestore'

export type Connection = { id: string; userId: string; name: string; createdAt: Timestamp }
export type Contact = { id: string; userId: string; connectionId: string; name: string; phone: string; createdAt: Timestamp }
export type Message = {
  id: string; userId: string; connectionId: string; contactIds: string[]
  text: string; status: 'scheduled' | 'sent'
  scheduledAt: Timestamp | null; sentAt: Timestamp | null; createdAt: Timestamp
}
