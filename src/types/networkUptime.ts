export interface NetworkEventRecord {
  id: string
  dbId?: number | string
  creadoEn: string               // Datetime ISO string (ej. 2026-09-22T15:20:00)
  fecha: string                  // YYYY-MM-DD (fecha de referencia del período, default hoy)
  enlace: string                 // Tipo de enlace (ej. ENLACES WAN NACIONAL, SD-WAN, etc.)
  departamento: string           // Departamento (LA PAZ, SANTA CRUZ, etc.)
  nombre: string                 // Nombre de proveedor, agencia o cajero ATM
  uptimeMensual: number          // Decimal (ej. 99.9700)
  uptimeAnual: number            // Decimal (ej. 99.9980)
  isEditing?: boolean
  selected?: boolean
}

export const DEFAULT_ENLACES = [
  'ENLACES WAN NACIONAL',
  'ENLACES SD-WAN NACIONALES',
  'ENLACES AGENCIAS NACIONAL',
  'ENLACES ATMS NACIONAL',
  'ENLACES AGENCIAS',
  'ENLACES ATMS',
  'ENLACES DEPARTAMENTALES'
]

export const DEFAULT_DEPARTAMENTOS = [
  'LA PAZ',
  'SANTA CRUZ',
  'COCHABAMBA',
  'ORURO',
  'POTOSI',
  'SUCRE',
  'TARIJA',
  'BENI',
  'PANDO',
  'NACIONAL'
]

/**
 * Limpia y normaliza un porcentaje ingresado por el usuario (acepta '99.97%', '99,80', 100, etc.)
 */
export function parseUptimePercentage(val: string | number | undefined): number {
  if (val === undefined || val === null) return 100
  if (typeof val === 'number') return isNaN(val) ? 100 : Math.min(100, Math.max(0, val))

  const clean = val.toString().replace('%', '').trim().replace(',', '.')
  const num = parseFloat(clean)
  if (isNaN(num)) return 100
  return Math.min(100, Math.max(0, num))
}

/**
 * Formatea un número decimal a porcentaje con formato español: 99.9756 -> '99,9756%'
 */
export function formatUptimePercent(val: number, decimals: number = 4): string {
  const formatted = val.toFixed(decimals).replace('.', ',')
  return `${formatted}%`
}
