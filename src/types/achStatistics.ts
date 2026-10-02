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
  'TRANSFERENCIA ENTRANTE',
  'TRANSFERENCIA SALIENTE',
  'DEVOLUCION DE FONDOS (CAIDA ACH)',
  'ENTRANTE',
  'SALIENTE',
  'DEVUELTO',
  'REGULARIZADO',
  'PENDIENTE',
  'RECHAZO'
]

export const DEFAULT_MLD_TIPOS: string[] = [
  'LIQUIDACION MLD',
  'REGULARIZACION MLD BCB',
  'ABONO BCB MLD',
  'MLD ENTRANTES',
  'MLD SALIENTES',
  'MLD LIQUIDACION',
  'MLD RECHAZOS',
  'MLD REGULARIZACION'
]

/**
 * Parsea un monto decimal o número que puede venir con 'Bs.', comas, puntos, etc.
 */
export function parseAchAmount(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val

  // Limpiar caracteres no numéricos excepto coma, punto y signo menos
  let clean = val.toString().trim()
  clean = clean.replace(/bs\.?/gi, '').replace(/\$/g, '').trim()

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
