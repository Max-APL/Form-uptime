export type StandardIndicator = 'II-PROVEEDOR' | 'II-PROGRAMADA' | 'II-FALLAS'

export interface RawEventRecord {
  id: string
  sistema: string
  fecha: string
  horaInicio: string
  horaFin: string
  tiempoServicioAbajo: string
  indicador: string
  motivo: string
  durationMinutes: number
  durationSeconds: number
}

export interface IndicatorBreakdown {
  label: string
  seconds: number
  minutes: number
  formattedTime: string // "HH:MM:SS" or "HH:MM"
  percent: number // raw number e.g. 0.094907...
  formattedPercent: string // "0,0949%"
}

export interface SystemMonthlyMetrics {
  sistema: string
  events: RawEventRecord[]
  hasEvents: boolean
  totalDowntimeSeconds: number
  totalDowntimeMinutes: number
  totalDowntimeFormatted: string // "00:41:00"
  downtimePercent: number // e.g. 0.0949
  downtimePercentFormatted: string // "0,0949%"
  uptimePercent: number // e.g. 99.9051
  uptimePercentFormatted: string // "99,9051%"
  totalPercentFormatted: string // "100,0000%"
  indicators: {
    proveedor: IndicatorBreakdown
    programada: IndicatorBreakdown
    fallas: IndicatorBreakdown
  }
}

export interface GlobalAverageSummary {
  averageUptime: number
  averageUptimeFormatted: string
  averageProveedor: number
  averageProveedorFormatted: string
  averageProgramada: number
  averageProgramadaFormatted: string
  averageFallas: number
  averageFallasFormatted: string
  averageTotalDowntime: number
  averageTotalDowntimeFormatted: string
  totalDowntimeSeconds: number
  totalDowntimeFormatted: string
  totalEvents: number
  affectedSystemsCount: number
}

export interface ConsolidatedReport {
  year: number
  month: number // 1 to 12
  monthName: string // e.g. "JUNIO"
  daysInMonth: number
  totalMonthHours: number // e.g. 720
  totalMonthMinutes: number // e.g. 43200
  systems: SystemMonthlyMetrics[]
  summary: GlobalAverageSummary
}
