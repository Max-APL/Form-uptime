import type {
  ConsolidatedReport,
  GlobalAverageSummary,
  IndicatorBreakdown,
  RawEventRecord,
  StandardIndicator,
  SystemMonthlyMetrics
} from '../types/uptime'

export const DEFAULT_SYSTEMS = [
  'CORE T24',
  'FISA',
  'ICBANKING',
  'BANCA MOVIL',
  'PORTAL WEB',
  'POSTILION',
  'ACH',
  'ONBASE',
  'SWIFT'
]

const MONTH_NAMES_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
]

export function getMonthNameSpanish(month: number): string {
  if (month < 1 || month > 12) return 'MES'
  return MONTH_NAMES_ES[month - 1]
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Normalizes indicator strings to the standard BMSC categories:
 * - II-PROVEEDOR
 * - II-PROGRAMADA
 * - II-FALLAS
 */
export function normalizeIndicator(raw: string): StandardIndicator {
  if (!raw) return 'II-FALLAS'
  const upper = raw.trim().toUpperCase()
  if (upper.includes('PROVEEDOR') || upper.includes('PROV')) {
    return 'II-PROVEEDOR'
  }
  if (upper.includes('PROGRAMADA') || upper.includes('PROG')) {
    return 'II-PROGRAMADA'
  }
  if (upper.includes('FALLA') || upper.includes('FALLAS')) {
    return 'II-FALLAS'
  }
  return 'II-FALLAS'
}

/**
 * Parses a duration from string (e.g. "00:41:00", "06:52", "1:30:15") or Excel fractional number into total seconds.
 */
export function parseDurationToSeconds(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  
  if (typeof val === 'number') {
    // If it's an Excel time fraction (where 1.0 = 24 hours)
    if (val < 1.0 && val > 0) {
      return Math.round(val * 86400)
    }
    // If it's already in seconds or minutes
    return Math.round(val)
  }

  const str = String(val).trim()
  if (!str || str === '-' || str === '0') return 0

  // Check formats: HH:MM:SS or HH:MM or MM:SS
  const parts = str.split(':').map(p => {
    const clean = p.replace(/[^0-9.]/g, '')
    return parseFloat(clean) || 0
  })

  if (parts.length === 3) {
    // HH:MM:SS
    const [hours, minutes, seconds] = parts
    return Math.round(hours * 3600 + minutes * 60 + seconds)
  } else if (parts.length === 2) {
    // HH:MM
    const [hours, minutes] = parts
    return Math.round(hours * 3600 + minutes * 60)
  } else if (parts.length === 1) {
    return Math.round(parts[0] * 60) // Assume minutes if single number
  }

  return 0
}

/**
 * Calculates duration in seconds between start time and end time strings if duration was empty.
 */
export function calculateDurationFromTimes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0

  const parseTimeParts = (t: string) => {
    const isPM = /p\.?\s*m\.?/i.test(t) || /pm/i.test(t)
    const isAM = /a\.?\s*m\.?/i.test(t) || /am/i.test(t)
    const clean = t.replace(/(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)/gi, '').trim()
    const parts = clean.split(':').map(p => parseInt(p, 10) || 0)
    let h = parts[0] || 0
    const m = parts[1] || 0
    const s = parts[2] || 0

    if (isPM && h < 12) h += 12
    if (isAM && h === 12) h = 0

    return h * 3600 + m * 60 + s
  }

  const startSec = parseTimeParts(startTime)
  const endSec = parseTimeParts(endTime)

  if (endSec >= startSec) {
    return endSec - startSec
  } else {
    // Spanned midnight
    return (86400 - startSec) + endSec
  }
}

/**
 * Formats seconds into HH:MM:SS
 */
export function formatSecondsToHHMMSS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safeSec / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)
  const seconds = safeSec % 60

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/**
 * Formats seconds into HH:MM (as used in Reporte de Tecnología)
 */
export function formatSecondsToHHMM(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safeSec / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}`
}

/**
 * Formats percentage number to Spanish locale string with 4 decimals e.g. "99,9051%" or "0,0949%"
 */
export function formatPercentSpanish(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0,0000%'
  const formatted = value.toFixed(4).replace('.', ',')
  return `${formatted}%`
}

/**
 * Calculates complete monthly Uptime and Downtime metrics for all systems.
 */
export function calculateUptimeMetrics(
  events: RawEventRecord[],
  year: number,
  month: number,
  customCatalog?: string[]
): ConsolidatedReport {
  const daysInMonth = getDaysInMonth(year, month)
  const totalMonthHours = daysInMonth * 24
  const totalMonthMinutes = totalMonthHours * 60
  const totalMonthSeconds = totalMonthMinutes * 60
  const monthName = getMonthNameSpanish(month)

  // Build the list of active systems: custom catalog + any systems in events not in catalog
  const catalog = customCatalog && customCatalog.length > 0 ? [...customCatalog] : [...DEFAULT_SYSTEMS]
  const systemsOrder: string[] = [...catalog]

  for (const ev of events) {
    const sysTrim = ev.sistema.trim()
    if (sysTrim && !systemsOrder.some(s => s.trim().toUpperCase() === sysTrim.toUpperCase())) {
      systemsOrder.push(sysTrim)
    }
  }

  const systemMetricsList: SystemMonthlyMetrics[] = []

  let totalEventsCount = 0
  let affectedSystemsCount = 0
  let globalTotalDowntimeSeconds = 0

  for (const systemName of systemsOrder) {
    const sysEvents = events.filter(
      e => e.sistema.trim().toUpperCase() === systemName.trim().toUpperCase()
    )

    let proveedorSec = 0
    let programadaSec = 0
    let fallasSec = 0

    for (const ev of sysEvents) {
      let sec = ev.durationSeconds
      if (sec <= 0 && ev.tiempoServicioAbajo) {
        sec = parseDurationToSeconds(ev.tiempoServicioAbajo)
      }
      if (sec <= 0 && ev.horaInicio && ev.horaFin) {
        sec = calculateDurationFromTimes(ev.horaInicio, ev.horaFin)
      }

      const ind = normalizeIndicator(ev.indicador)
      if (ind === 'II-PROVEEDOR') {
        proveedorSec += sec
      } else if (ind === 'II-PROGRAMADA') {
        programadaSec += sec
      } else {
        fallasSec += sec
      }
    }

    const totalDowntimeSec = proveedorSec + programadaSec + fallasSec
    const totalDowntimeMin = totalDowntimeSec / 60

    if (sysEvents.length > 0 && totalDowntimeSec > 0) {
      affectedSystemsCount++
    }
    totalEventsCount += sysEvents.length
    globalTotalDowntimeSeconds += totalDowntimeSec

    // Percentage calculations
    const proveedorPercent = (proveedorSec / totalMonthSeconds) * 100
    const programadaPercent = (programadaSec / totalMonthSeconds) * 100
    const fallasPercent = (fallasSec / totalMonthSeconds) * 100
    const downtimePercent = proveedorPercent + programadaPercent + fallasPercent
    const uptimePercent = Math.max(0, 100 - downtimePercent)

    const proveedorBreakdown: IndicatorBreakdown = {
      label: 'II-PROVEEDOR',
      seconds: proveedorSec,
      minutes: proveedorSec / 60,
      formattedTime: formatSecondsToHHMM(proveedorSec),
      percent: proveedorPercent,
      formattedPercent: formatPercentSpanish(proveedorPercent)
    }

    const programadaBreakdown: IndicatorBreakdown = {
      label: 'II-PROGRAMADA',
      seconds: programadaSec,
      minutes: programadaSec / 60,
      formattedTime: formatSecondsToHHMM(programadaSec),
      percent: programadaPercent,
      formattedPercent: formatPercentSpanish(programadaPercent)
    }

    const fallasBreakdown: IndicatorBreakdown = {
      label: 'II-FALLAS',
      seconds: fallasSec,
      minutes: fallasSec / 60,
      formattedTime: formatSecondsToHHMM(fallasSec),
      percent: fallasPercent,
      formattedPercent: formatPercentSpanish(fallasPercent)
    }

    systemMetricsList.push({
      sistema: systemName,
      events: sysEvents,
      hasEvents: sysEvents.length > 0,
      totalDowntimeSeconds: totalDowntimeSec,
      totalDowntimeMinutes: totalDowntimeMin,
      totalDowntimeFormatted: formatSecondsToHHMMSS(totalDowntimeSec),
      downtimePercent,
      downtimePercentFormatted: formatPercentSpanish(downtimePercent),
      uptimePercent,
      uptimePercentFormatted: formatPercentSpanish(uptimePercent),
      totalPercentFormatted: '100,0000%',
      indicators: {
        proveedor: proveedorBreakdown,
        programada: programadaBreakdown,
        fallas: fallasBreakdown
      }
    })
  }

  // Calculate arithmetic averages across systems
  const count = systemMetricsList.length || 1
  const sumUptime = systemMetricsList.reduce((acc, s) => acc + s.uptimePercent, 0)
  const sumProveedor = systemMetricsList.reduce((acc, s) => acc + s.indicators.proveedor.percent, 0)
  const sumProgramada = systemMetricsList.reduce((acc, s) => acc + s.indicators.programada.percent, 0)
  const sumFallas = systemMetricsList.reduce((acc, s) => acc + s.indicators.fallas.percent, 0)
  const sumDowntime = systemMetricsList.reduce((acc, s) => acc + s.downtimePercent, 0)

  const averageUptime = sumUptime / count
  const averageProveedor = sumProveedor / count
  const averageProgramada = sumProgramada / count
  const averageFallas = sumFallas / count
  const averageTotalDowntime = sumDowntime / count

  const summary: GlobalAverageSummary = {
    averageUptime,
    averageUptimeFormatted: formatPercentSpanish(averageUptime),
    averageProveedor,
    averageProveedorFormatted: formatPercentSpanish(averageProveedor),
    averageProgramada,
    averageProgramadaFormatted: formatPercentSpanish(averageProgramada),
    averageFallas,
    averageFallasFormatted: formatPercentSpanish(averageFallas),
    averageTotalDowntime,
    averageTotalDowntimeFormatted: formatPercentSpanish(averageTotalDowntime),
    totalDowntimeSeconds: globalTotalDowntimeSeconds,
    totalDowntimeFormatted: formatSecondsToHHMMSS(globalTotalDowntimeSeconds),
    totalEvents: totalEventsCount,
    affectedSystemsCount
  }

  return {
    year,
    month,
    monthName,
    daysInMonth,
    totalMonthHours,
    totalMonthMinutes,
    systems: systemMetricsList,
    summary
  }
}
