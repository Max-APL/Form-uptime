// Formateadores específicos para la emisión del Informe Oficial de UPTIME BMSC (PDF)

const SPANISH_DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const SPANISH_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

/**
 * Formatea una fecha YYYY-MM-DD o DD/MM/YYYY a formato largo en español:
 * Ej: "2026-03-25" -> "miércoles, 25 de marzo de 2026"
 */
export function formatDateLongSpanish(dateStr: string | undefined): string {
  if (!dateStr || !dateStr.trim()) return ''

  let y = 0
  let m = 0
  let d = 0

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number)
    if (parts.length >= 3) {
      y = parts[0]
      m = parts[1]
      d = parts[2]
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number)
    if (parts.length >= 3) {
      d = parts[0]
      m = parts[1]
      y = parts[2]
    }
  }

  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) {
    return dateStr
  }

  // Usar mediodía (12:00) para evitar desfases de huso horario
  const dateObj = new Date(y, m - 1, d, 12, 0, 0)
  const dayName = SPANISH_DAYS[dateObj.getDay()]
  const monthName = SPANISH_MONTHS[m - 1]

  return `${dayName}, ${d} de ${monthName} de ${y}`
}

/**
 * Formatea una hora HH:MM:SS o HH:MM a formato de 12 horas con 'a. m.' / 'p. m.'
 * Ej: "22:31:00" -> "10:31:00 p. m."
 * Ej: "13:12:00" -> "1:12:00 p. m."
 * Ej: "01:01:00" -> "1:01:00 a. m."
 */
export function formatTimeTo12Hour(timeStr: string | undefined): string {
  if (!timeStr || !timeStr.trim()) return ''

  const cleaned = timeStr.trim().toLowerCase()
  if (cleaned.includes('m.') || cleaned.includes('am') || cleaned.includes('pm')) {
    return timeStr
  }

  const parts = cleaned.split(':').map(p => parseInt(p, 10))
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return timeStr
  }

  const rawHours = parts[0]
  const minutes = parts[1].toString().padStart(2, '0')
  const seconds = (parts[2] !== undefined && !isNaN(parts[2])) ? parts[2].toString().padStart(2, '0') : '00'

  const period = rawHours >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = rawHours % 12 === 0 ? 12 : rawHours % 12

  return `${hour12}:${minutes}:${seconds} ${period}`
}

export interface OfficialReportMetadata {
  informeCode: string
  destinatarioNombre: string
  destinatarioCargo: string
  remitenteNombre: string
  remitenteCargo: string
  fechaEmision: string
  referencia: string
  redaccion: string
}

/**
 * Genera los metadatos predeterminados para el informe oficial basados en el mes y año
 */
export function getDefaultOfficialReportMetadata(year: number, month: number): OfficialReportMetadata {
  const monthName = SPANISH_MONTHS[month - 1] || 'marzo'
  
  // Fecha de emisión sugerida: 7 del mes siguiente
  let nextMonth = month + 1
  let nextYear = year
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear = year + 1
  }
  const nextMonthName = SPANISH_MONTHS[nextMonth - 1]
  const capitalizedNextMonth = nextMonthName.charAt(0).toUpperCase() + nextMonthName.slice(1)
  const defaultFechaEmision = `07 de ${capitalizedNextMonth} de ${nextYear}`

  // Correlativo sugerido
  const correlativoNum = String(month + 10).padStart(3, '0')
  const informeCode = `GNS/SGT/${correlativoNum}/${year}`

  return {
    informeCode,
    destinatarioNombre: 'Boris Osman Cazuriaga Cajias',
    destinatarioCargo: 'Gerente de Sistemas',
    remitenteNombre: 'Victor Bernardo Cocarico Delgado',
    remitenteCargo: 'Subgerente de Tecnología',
    fechaEmision: defaultFechaEmision,
    referencia: `Informe de UPTIME de sistemas críticos del mes de ${monthName} - ${year}`,
    redaccion: `A continuación se informa que durante el mes de ${monthName} de ${year} el comportamiento de nuestros sistemas críticos fue de acuerdo a lo siguiente, tomando en cuenta que estamos en fase de estabilización en producción del nuevo Core transaccional (sistema T24):`
  }
}
