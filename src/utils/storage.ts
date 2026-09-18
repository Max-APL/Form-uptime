import type { EventRecordV2 } from '../types/uptime'

const STORAGE_KEY_PREFIX = 'bmsc_uptime_v2_draft_'

export function getDraftStorageKey(year: number, month: number): string {
  return `${STORAGE_KEY_PREFIX}${year}_${month}`
}

export function saveDraft(year: number, month: number, events: EventRecordV2[]): void {
  try {
    const key = getDraftStorageKey(year, month)
    const payload = {
      timestamp: Date.now(),
      year,
      month,
      events
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (err) {
    console.error('Error guardando borrador local:', err)
  }
}

export function loadDraft(year: number, month: number): { timestamp: number; events: EventRecordV2[] } | null {
  try {
    const key = getDraftStorageKey(year, month)
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.events)) {
      return {
        timestamp: parsed.timestamp || Date.now(),
        events: parsed.events
      }
    }
  } catch (err) {
    console.error('Error cargando borrador local:', err)
  }
  return null
}

export function clearDraft(year: number, month: number): void {
  try {
    const key = getDraftStorageKey(year, month)
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Error limpiando borrador local:', err)
  }
}

export function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return 'No guardado'
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 5) return 'Guardado hace unos instantes'
  if (diffSec < 60) return `Guardado hace ${diffSec} seg`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `Guardado hace ${diffMin} min`
  const diffHour = Math.floor(diffMin / 60)
  return `Guardado hace ${diffHour} h`
}
