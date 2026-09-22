import type { NetworkEventRecord } from '../types/networkUptime'

const NETWORK_DRAFT_PREFIX = 'bmsc_network_draft_'

export function getNetworkDraftKey(year: number, month: number): string {
  const m = String(month).padStart(2, '0')
  return `${NETWORK_DRAFT_PREFIX}${year}_${m}`
}

export function loadNetworkDraft(year: number, month: number): { records: NetworkEventRecord[]; timestamp: number } | null {
  try {
    const key = getNetworkDraftKey(year, month)
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.records)) {
      return {
        records: parsed.records,
        timestamp: parsed.timestamp || Date.now()
      }
    }
  } catch (err) {
    console.error('Error al cargar borrador de redes:', err)
  }
  return null
}

export function saveNetworkDraft(year: number, month: number, records: NetworkEventRecord[]): void {
  try {
    const key = getNetworkDraftKey(year, month)
    const data = {
      year,
      month,
      records,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error('Error al guardar borrador de redes:', err)
  }
}

export function clearNetworkDraft(year: number, month: number): void {
  try {
    const key = getNetworkDraftKey(year, month)
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Error al limpiar borrador de redes:', err)
  }
}
