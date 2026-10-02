export interface AchStatisticRecord {
  id: string
  idRegistro?: number | string
  dbId?: number | string
  creadoEn?: string              // Datetime ISO string (ej. 2026-10-01T15:20:00)
  fecha: string                  // YYYY-MM-DD (fecha del registro / incidente)
  tipo: string                   // Tipo de transacción / resolución (ej. ENTRANTE, SALIENTE, DEVUELTO, etc.)
  cantidad: number               // Número entero de transacciones
  monto: number                  // Monto decimal en Bs.
  tipoMld: string                // Tipo de registro MLD Banco Central
  cantidadMld: number            // Cantidad MLD Banco Central
  montoMld: number               // Monto MLD Banco Central en Bs.
  revision: number               // Validación de caso revisado (0 = Pendiente, 1 = Revisado)
  selected?: boolean             // Selección para acciones por lote en frontend
}

export const DEFAULT_ACH_TIPOS: string[] = [
  'Abonos',
  'Debitos'
]

export const DEFAULT_MLD_TIPOS: string[] = [
  'Abonos',
  'Debitos'
]

/**
 * Normaliza los valores de tipo ACH o MLD a los canónicos: 'Abonos' o 'Debitos'
 */
export function normalizeAchTipo(val: string | undefined): string {
  if (!val) return ''
  const clean = val.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (clean.includes('abono')) return 'Abonos'
  if (clean.includes('debito')) return 'Debitos'
  return val.trim()
}

/**
 * Normaliza fechas provenientes de Excel o portapapeles (ej. 9/1/2026, 01/09/2026, 2026-09-01) a YYYY-MM-DD
 */
export function normalizeAchDate(val: string | undefined, referenceDate?: string): string {
  if (!val) return referenceDate || new Date().toISOString().slice(0, 10)
  const trimmed = val.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  const separator = trimmed.includes('/') ? '/' : trimmed.includes('-') ? '-' : null
  if (separator) {
    const parts = trimmed.split(separator).map(p => p.trim())
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // AAAA-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
      }

      const p1 = parseInt(parts[0], 10)
      const p2 = parseInt(parts[1], 10)
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]

      let refMonth: number | null = null
      if (referenceDate) {
        const refParts = referenceDate.split('-')
        if (refParts.length === 3) refMonth = parseInt(refParts[1], 10)
      }

      let month = p2
      let day = p1

      // Si el primer número coincide con el mes del período de referencia (ej: 9/1/2026 con mes 9)
      if (refMonth && p1 === refMonth && p2 !== refMonth && p2 <= 31) {
        month = p1
        day = p2
      } else if (p1 > 12 && p2 <= 12) {
        // Definitivamente D/M/AAAA
        day = p1
        month = p2
      } else if (p2 > 12 && p1 <= 12) {
        // Definitivamente M/D/AAAA
        month = p1
        day = p2
      }

      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  return trimmed
}

/**
 * Parsea un monto decimal o número que puede venir con 'Bs.', comas, puntos, '-' (cero), etc.
 */
export function parseAchAmount(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val

  // Limpiar caracteres no numéricos excepto coma, punto y signo menos
  let clean = val.toString().trim()
  clean = clean.replace(/bs\.?/gi, '').replace(/\$/g, '').trim()

  // Soporte para formato contable de Excel donde '-' representa 0.00
  if (clean === '-' || clean === '–' || clean === '—' || clean === '- ' || clean === ' -') return 0

  // Si tiene formato español '1.250,50' -> convertir a '1250.50'
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      // 1.250,50
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
      // 1,250.50
      clean = clean.replace(/,/g, '')
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.')
  }

  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

/**
 * Parsea una cantidad entera
 */
export function parseAchQuantity(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, Math.round(val))

  const clean = val.toString().replace(/[^0-9-]/g, '').trim()
  const num = parseInt(clean, 10)
  return isNaN(num) ? 0 : Math.max(0, num)
}

/**
 * Formatea un número decimal a moneda con formato boliviano: 1250450.5 -> 'Bs. 1.250.450,50'
 */
export function formatCurrencyBs(val: number): string {
  const num = Number(val) || 0
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num).replace('BOB', 'Bs.')
}

/**
 * Formatea cantidades con separador de miles: 12500 -> '12.500'
 */
export function formatQuantity(val: number): string {
  const num = Number(val) || 0
  return new Intl.NumberFormat('es-BO', {
    maximumFractionDigits: 0
  }).format(num)
}
