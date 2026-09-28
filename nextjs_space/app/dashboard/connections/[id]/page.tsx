import { ContactsView } from '../../_components/contacts-view'

export default async function ConnectionContactsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ContactsView connectionId={id} />
}
