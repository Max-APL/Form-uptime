import { describe, it, expect } from 'vitest'
import {
  calculateDurationFromTimes,
  formatSecondsToHHMMSS,
  normalizeIndicator,
  calculateUptimeMetricsV2
} from '../../src/utils/calculator'
import { parsePastedTableText } from '../../src/utils/clipboardParser'
import type { EventRecordV2 } from '../../src/types/uptime'

describe('Form Uptime V2 - Calculator and Durations', () => {
  it('calculates duration between start and end times correctly', () => {
    expect(calculateDurationFromTimes('08:00:00', '08:45:00')).toBe(2700)
    expect(calculateDurationFromTimes('10:00', '10:15')).toBe(900)
  })

  it('handles events crossing midnight', () => {
    // 23:30 to 00:30 is 60 minutes = 3600 seconds
    expect(calculateDurationFromTimes('23:30:00', '00:30:00')).toBe(3600)
  })

  it('formats seconds to HH:MM:SS format', () => {
    expect(formatSecondsToHHMMSS(3600)).toBe('01:00:00')
    expect(formatSecondsToHHMMSS(900)).toBe('00:15:00')
    expect(formatSecondsToHHMMSS(65)).toBe('00:01:05')
  })

  it('normalizes indicators accurately', () => {
    expect(normalizeIndicator('proveedor')).toBe('II-PROVEEDOR')
    expect(normalizeIndicator('mantenimiento programada')).toBe('II-PROGRAMADA')
    expect(normalizeIndicator('falla')).toBe('II-FALLAS')
    expect(normalizeIndicator('desconocido')).toBe('II-FALLAS')
  })
})

describe('Form Uptime V2 - Metrics & Uptime % with New Columns', () => {
  it('calculates monthly Uptime and counts declared vs undeclared events', () => {
    const events: EventRecordV2[] = [
      {
        id: '1',
        sistema: 'CORE T24',
        componente: 'Base de Datos',
        fecha: '2026-06-10',
        horaInicio: '01:00:00',
        horaFin: '01:30:00',
        tiempoServicioAbajo: '00:30:00',
        durationMinutes: 30,
        durationSeconds: 1800,
        indicador: 'II-PROGRAMADA',
        responsable: 'DBA',
        origen: 'Monitoreo',
        declarado: true,
        bitacora: 'INC-100',
        motivo: 'Parche',
        solucion: 'Aplicado'
      },
      {
        id: '2',
        sistema: 'CORE T24',
        componente: 'Switch',
        fecha: '2026-06-12',
        horaInicio: '04:00:00',
        horaFin: '04:15:00',
        tiempoServicioAbajo: '00:15:00',
        durationMinutes: 15,
        durationSeconds: 900,
        indicador: 'II-FALLAS',
        responsable: 'Redes',
        origen: 'Zabbix',
        declarado: false,
        bitacora: 'INC-101',
        motivo: 'Caída de interfaz',
        solucion: 'Reemplazo de cable'
      }
    ]

    const report = calculateUptimeMetricsV2(events, 2026, 6)
    const coreMetrics = report.systems.find((s: any) => s.sistema === 'CORE T24')

    expect(coreMetrics).toBeDefined()
    expect(coreMetrics?.events.length).toBe(2)
    expect(coreMetrics?.declaredCount).toBe(1)
    expect(coreMetrics?.undeclaredCount).toBe(1)
    expect(coreMetrics?.totalDowntimeSeconds).toBe(2700)
    expect(report.summary.totalEvents).toBe(2)
    expect(report.summary.totalDeclaredCount).toBe(1)
    expect(report.summary.totalUndeclaredCount).toBe(1)
  })
})

describe('Form Uptime V2 - Clipboard TSV / CSV Parsing', () => {
  it('parses tab-delimited text with headers into V2 event records', () => {
    const tsvData = [
      'Sistema\tComponente\tFecha\tInicio\tFin\tDuración\tIndicador\tResponsable\tOrigen\tDeclarado\tRevisión\tBitacora\tMotivo\tSolucion',
      'FISA\tCore\t2026-06-15\t09:00:00\t09:20:00\t00:20:00\tII-FALLAS\tInfraestructura\tDynatrace\tSí\tSí\tTKT-999\tTimeout\tReinicio'
    ].join('\n')

    const result = parsePastedTableText(tsvData)
    expect(result.records.length).toBe(1)

    const rec = result.records[0]
    expect(rec.sistema).toBe('FISA')
    expect(rec.componente).toBe('Core')
    expect(rec.fecha).toBe('2026-06-15')
    expect(rec.horaInicio).toBe('09:00:00')
    expect(rec.horaFin).toBe('09:20:00')
    expect(rec.durationSeconds).toBe(1200)
    expect(rec.declarado).toBe(true)
    expect(rec.revision).toBe(true)
    expect(rec.responsable).toBe('Infraestructura')
    expect(rec.origen).toBe('Dynatrace')
    expect(rec.bitacora).toBe('TKT-999')
    expect(rec.motivo).toBe('Timeout')
    expect(rec.solucion).toBe('Reinicio')
  })
})
