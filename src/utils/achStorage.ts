import type { AchStatisticRecord } from '../types/achStatistics'

const ACH_DRAFT_PREFIX = 'bmsc_ach_draft_'

export function getAchDraftKey(year: number, month: number): string {
  const m = String(month).padStart(2, '0')
  return `${ACH_DRAFT_PREFIX}${year}_${m}`
}

export function loadAchDraft(year: number, month: number): { records: AchStatisticRecord[]; timestamp: number } | null {
  try {
    const key = getAchDraftKey(year, month)
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
    console.error('Error al cargar borrador de ACH:', err)
  }
  return null
}

export function saveAchDraft(year: number, month: number, records: AchStatisticRecord[]): void {
  try {
    const key = getAchDraftKey(year, month)
    const data = {
      year,
      month,
      records,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error('Error al guardar borrador de ACH:', err)
  }
}

export function clearAchDraft(year: number, month: number): void {
  try {
    const key = getAchDraftKey(year, month)
    localStorage.removeItem(key)
  } catch (err) {
    console.error('Error al limpiar borrador de ACH:', err)
  }
}
