import { processDueMessages } from '@/lib/server'

const g = globalThis as unknown as { __msgScheduler?: ReturnType<typeof setInterval> }

const tick = async (): Promise<void> => {
  try {
    const count = await processDueMessages()
    if (count > 0) console.log(`[scheduler] ${count} mensagem(ns) marcada(s) como enviada(s)`)
  } catch (e) {
    console.error('[scheduler] erro ao processar mensagens agendadas', e)
  }
}

// Equivalente a uma scheduled function: roda a cada minuto no servidor
export const startScheduler = (): void => {
  if (g.__msgScheduler) return
  g.__msgScheduler = setInterval(tick, 60_000)
  void tick()
}
