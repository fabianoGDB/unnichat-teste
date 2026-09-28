import { MessagesView } from '../_components/messages-view'

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ connectionId?: string }> }) {
  const sp = await searchParams
  return <MessagesView initialConnectionId={sp?.connectionId ?? ''} />
}
