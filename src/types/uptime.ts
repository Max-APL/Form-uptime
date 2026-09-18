export type StandardIndicator = 'II-PROVEEDOR' | 'II-PROGRAMADA' | 'II-FALLAS' | string

export interface EventRecordV2 {
  id: string
  dbId?: number | string     // ID_EVENTO en Oracle
  sistema: string
  componente?: string        // [NUEVO] p.ej. Base de Datos, Servidor, Red, API, etc.
  fecha: string             // YYYY-MM-DD o DD/MM/YYYY
  horaInicio: string        // HH:MM:SS o HH:MM
  horaFin: string           // HH:MM:SS o HH:MM
  tiempoServicioAbajo: string // "HH:MM:SS"
  durationMinutes: number
  durationSeconds: number
  indicador: StandardIndicator
  responsable?: string       // [NUEVO] p.ej. Infraestructura, DBA, Proveedor X
  origen?: string            // [NUEVO] p.ej. Zabbix, Dynatrace, Usuario, Mesa de Ayuda
  declarado?: boolean        // [NUEVO] Booleano (Sí/No)
  bitacora?: string          // [NUEVO] Código o ID de ticket/caso
  motivo: string            // Detalle o causa
  solucion?: string          // [NUEVO] Resolución o acción tomada
  isEditing?: boolean
  selected?: boolean
  createdAt?: string
  updatedAt?: string
}

// Alias for backwards compatibility
export type RawEventRecord = EventRecordV2

export interface IndicatorBreakdown {
  label: string
  seconds: number
  minutes: number
  formattedTime: string
  percent: number
  formattedPercent: string
}

export interface SystemMonthlyMetricsV2 {
  sistema: string
  events: EventRecordV2[]
  hasEvents: boolean
  totalDowntimeSeconds: number
  totalDowntimeMinutes: number
  totalDowntimeFormatted: string
  downtimePercent: number
  downtimePercentFormatted: string
  uptimePercent: number
  uptimePercentFormatted: string
  totalPercentFormatted: string
  declaredCount: number
  undeclaredCount: number
  indicators: {
    proveedor: IndicatorBreakdown
    programada: IndicatorBreakdown
    fallas: IndicatorBreakdown
  }
}

export type SystemMonthlyMetrics = SystemMonthlyMetricsV2

export interface GlobalAverageSummaryV2 {
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
  totalDeclaredCount: number
  totalUndeclaredCount: number
  affectedSystemsCount: number
}

export type GlobalAverageSummary = GlobalAverageSummaryV2

export interface ConsolidatedReportV2 {
  year: number
  month: number
  monthName: string
  daysInMonth: number
  totalMonthHours: number
  totalMonthMinutes: number
  systems: SystemMonthlyMetricsV2[]
  summary: GlobalAverageSummaryV2
}

export type ConsolidatedReport = ConsolidatedReportV2

export interface TableFilters {
  searchQuery: string
  sistema: string
  indicador: string
  declarado: 'ALL' | 'YES' | 'NO'
  responsable: string
  componente: string
}
