import { useEffect, useState } from 'react'
import { onSnapshot, type Query, type DocumentData } from 'firebase/firestore'

export const useFirestore = <T extends { id: string }>(
  q: Query<DocumentData> | null,
  key: string,
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) { setData([]); setLoading(false); return }
    setLoading(true)
    return onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
      setLoading(false)
    })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading }
}
