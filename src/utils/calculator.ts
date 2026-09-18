import type {
  ConsolidatedReportV2,
  EventRecordV2,
  GlobalAverageSummaryV2,
  IndicatorBreakdown,
  StandardIndicator,
  SystemMonthlyMetricsV2
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

export const DEFAULT_COMPONENTS = [
  'Base de Datos',
  'Servidor de Aplicaciones',
  'API Gateway',
  'Red y Firewall',
  'Canal Digital',
  'Switch Transaccional',
  'Almacenamiento SAN',
  'Enlace de Comunicaciones',
  'Servicio Web',
  'Cola de Mensajería'
]

export const DEFAULT_RESPONSIBLES = [
  'Infraestructura',
  'DBA',
  'Desarrollo Canales',
  'Redes y Comunicaciones',
  'Soporte N2',
  'Seguridad de la Información',
  'Proveedor Externo',
  'Operaciones TI'
]

export const DEFAULT_ORIGINS = [
  'Monitoreo Zabbix',
  'Alerta Dynatrace',
  'Reporte Mesa de Ayuda',
  'Reporte de Sucursal',
  'Notificación Proveedor',
  'Detección Operativa'
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

export function normalizeIndicator(raw: string): StandardIndicator {
  if (!raw) return 'II-FALLAS'
  const upper = raw.trim().toUpperCase()

  // Preserve explicit structured codes (e.g., IBI-FALLAS, II-PROVEEDOR, IBI-PROGRAMADA, RED-01)
  if (/^[A-Z0-9]+-[A-Z0-9_-]+$/.test(upper)) {
    return upper
  }

  // Fallback heuristic matching for natural language descriptions
  if (upper.includes('PROVEEDOR') || upper.includes('PROV')) {
    return 'II-PROVEEDOR'
  }
  if (upper.includes('PROGRAMADA') || upper.includes('PROG')) {
    return 'II-PROGRAMADA'
  }
  return 'II-FALLAS'
}

export function parseDurationToSeconds(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  
  if (typeof val === 'number') {
    if (val < 1.0 && val > 0) {
      return Math.round(val * 86400)
    }
    return Math.round(val)
  }

  const str = String(val).trim()
  if (!str || str === '-' || str === '0') return 0

  const parts = str.split(':').map(p => {
    const clean = p.replace(/[^0-9.]/g, '')
    return parseFloat(clean) || 0
  })

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    return Math.round(hours * 3600 + minutes * 60 + seconds)
  } else if (parts.length === 2) {
    const [hours, minutes] = parts
    return Math.round(hours * 3600 + minutes * 60)
  } else if (parts.length === 1) {
    return Math.round(parts[0] * 60)
  }

  return 0
}

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

export function formatSecondsToHHMMSS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safeSec / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)
  const seconds = safeSec % 60

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatSecondsToHHMM(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safeSec / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}`
}

export function formatPercentSpanish(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0,0000%'
  const formatted = value.toFixed(4).replace('.', ',')
  return `${formatted}%`
}

export function calculateUptimeMetricsV2(
  events: EventRecordV2[],
  year: number,
  month: number,
  customCatalog?: string[]
): ConsolidatedReportV2 {
  const daysInMonth = getDaysInMonth(year, month)
  const totalMonthHours = daysInMonth * 24
  const totalMonthMinutes = totalMonthHours * 60
  const totalMonthSeconds = totalMonthMinutes * 60
  const monthName = getMonthNameSpanish(month)

  const catalog = customCatalog !== undefined ? [...customCatalog] : [...DEFAULT_SYSTEMS]
  const systemsOrder: string[] = [...catalog]

  for (const ev of events) {
    const sysTrim = (ev.sistema || '').trim()
    if (sysTrim && !systemsOrder.some(s => s.trim().toUpperCase() === sysTrim.toUpperCase())) {
      systemsOrder.push(sysTrim)
    }
  }

  const systemMetricsList: SystemMonthlyMetricsV2[] = []

  let totalEventsCount = 0
  let affectedSystemsCount = 0
  let globalTotalDowntimeSeconds = 0
  let totalDeclaredCount = 0
  let totalUndeclaredCount = 0

  for (const systemName of systemsOrder) {
    const sysEvents = events.filter(
      e => (e.sistema || '').trim().toUpperCase() === systemName.trim().toUpperCase()
    )

    let proveedorSec = 0
    let programadaSec = 0
    let fallasSec = 0
    let sysDeclaredCount = 0
    let sysUndeclaredCount = 0

    for (const ev of sysEvents) {
      let sec = ev.durationSeconds
      if (sec <= 0 && ev.tiempoServicioAbajo) {
        sec = parseDurationToSeconds(ev.tiempoServicioAbajo)
      }
      if (sec <= 0 && ev.horaInicio && ev.horaFin) {
        sec = calculateDurationFromTimes(ev.horaInicio, ev.horaFin)
      }

      const ind = (ev.indicador || '').toUpperCase()
      if (ind.includes('PROVEEDOR') || ind.includes('PROV')) {
        proveedorSec += sec
      } else if (ind.includes('PROGRAMADA') || ind.includes('PROG')) {
        programadaSec += sec
      } else {
        fallasSec += sec
      }

      if (ev.declarado) {
        sysDeclaredCount++
        totalDeclaredCount++
      } else {
        sysUndeclaredCount++
        totalUndeclaredCount++
      }
    }

    const totalDowntimeSec = proveedorSec + programadaSec + fallasSec
    const totalDowntimeMin = totalDowntimeSec / 60

    if (sysEvents.length > 0 && totalDowntimeSec > 0) {
      affectedSystemsCount++
    }
    totalEventsCount += sysEvents.length
    globalTotalDowntimeSeconds += totalDowntimeSec

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
      declaredCount: sysDeclaredCount,
      undeclaredCount: sysUndeclaredCount,
      indicators: {
        proveedor: proveedorBreakdown,
        programada: programadaBreakdown,
        fallas: fallasBreakdown
      }
    })
  }

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

  const summary: GlobalAverageSummaryV2 = {
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
    totalDeclaredCount,
    totalUndeclaredCount,
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

// Alias for backwards compatibility
export const calculateUptimeMetrics = calculateUptimeMetricsV2
