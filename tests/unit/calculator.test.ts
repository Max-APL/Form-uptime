import { describe, it, expect } from 'vitest'
import {
  calculateUptimeMetrics,
  formatPercentSpanish,
  formatSecondsToHHMMSS,
  formatSecondsToHHMM,
  parseDurationToSeconds,
  normalizeIndicator,
  getDaysInMonth
} from '../../src/utils/calculator'
import type { RawEventRecord } from '../../src/types/uptime'

describe('Uptime & Downtime Calculator Engine', () => {
  it('calculates days in month correctly for leap/non-leap and 30/31 day months', () => {
    expect(getDaysInMonth(2026, 6)).toBe(30) // June 2026
    expect(getDaysInMonth(2026, 7)).toBe(31) // July 2026
    expect(getDaysInMonth(2024, 2)).toBe(29) // Feb 2024 (leap)
    expect(getDaysInMonth(2025, 2)).toBe(28) // Feb 2025 (non-leap)
  })

  it('normalizes indicators accurately', () => {
    expect(normalizeIndicator('II-FALLAS')).toBe('II-FALLAS')
    expect(normalizeIndicator('IIBHIBM FALLAS')).toBe('II-FALLAS')
    expect(normalizeIndicator('fallas de red')).toBe('II-FALLAS')
    expect(normalizeIndicator('II-PROVEEDOR')).toBe('II-PROVEEDOR')
    expect(normalizeIndicator('IIBHIBM PROVEEDOR')).toBe('II-PROVEEDOR')
    expect(normalizeIndicator('II-PROGRAMADA')).toBe('II-PROGRAMADA')
    expect(normalizeIndicator('mantenimiento programado')).toBe('II-PROGRAMADA')
    // Support production and custom indicator codes
    expect(normalizeIndicator('IBI-FALLAS')).toBe('IBI-FALLAS')
    expect(normalizeIndicator('IBI-PROVEEDOR')).toBe('IBI-PROVEEDOR')
    expect(normalizeIndicator('IBI-PROGRAMADA')).toBe('IBI-PROGRAMADA')
    expect(normalizeIndicator('REDES-01')).toBe('REDES-01')
  })

  it('parses duration strings and formats them', () => {
    expect(parseDurationToSeconds('00:41:00')).toBe(41 * 60)
    expect(parseDurationToSeconds('06:52')).toBe(6 * 3600 + 52 * 60)
    expect(parseDurationToSeconds('00:00:00')).toBe(0)
    expect(formatSecondsToHHMMSS(2460)).toBe('00:41:00')
    expect(formatSecondsToHHMM(24720)).toBe('06:52')
  })

  it('formats percentages with Spanish comma and 4 decimals', () => {
    expect(formatPercentSpanish(0.0949074)).toBe('0,0949%')
    expect(formatPercentSpanish(99.9050926)).toBe('99,9051%')
    expect(formatPercentSpanish(100)).toBe('100,0000%')
    expect(formatPercentSpanish(0)).toBe('0,0000%')
  })

  it('matches exact calculations from Image 1 & 2 (June 2026, CORE T24, 41 min incident)', () => {
    const juneEvents: RawEventRecord[] = [
      {
        id: '1',
        sistema: 'CORE T24',
        fecha: 'jueves, 18 de junio de 2026',
        horaInicio: '10:25:00 a. m.',
        horaFin: '11:06:00 a. m.',
        tiempoServicioAbajo: '00:41:00',
        indicador: 'II-FALLAS',
        motivo: 'Problemas en inicios de sesión de usuarios',
        durationMinutes: 41,
        durationSeconds: 2460
      }
    ]

    const report = calculateUptimeMetrics(juneEvents, 2026, 6)

    expect(report.daysInMonth).toBe(30)
    expect(report.totalMonthHours).toBe(720)
    expect(report.totalMonthMinutes).toBe(43200)

    const coreT24 = report.systems.find(s => s.sistema === 'CORE T24')
    expect(coreT24).toBeDefined()
    expect(coreT24?.totalDowntimeFormatted).toBe('00:41:00')
    expect(coreT24?.downtimePercentFormatted).toBe('0,0949%')
    expect(coreT24?.uptimePercentFormatted).toBe('99,9051%')
    expect(coreT24?.indicators.fallas.formattedPercent).toBe('0,0949%')
    expect(coreT24?.indicators.proveedor.formattedPercent).toBe('0,0000%')
    expect(coreT24?.indicators.programada.formattedPercent).toBe('0,0000%')

    // System without incidents like POSTILION
    const postilion = report.systems.find(s => s.sistema === 'POSTILION')
    expect(postilion).toBeDefined()
    expect(postilion?.hasEvents).toBe(false)
    expect(postilion?.totalDowntimeFormatted).toBe('00:00:00')
    expect(postilion?.downtimePercentFormatted).toBe('0,0000%')
    expect(postilion?.uptimePercentFormatted).toBe('100,0000%')
  })

  it('matches calculations from Image 4 (July 2026, BANCA MOVIL with programada & fallas)', () => {
    const julyEvents: RawEventRecord[] = [
      {
        id: '1',
        sistema: 'BANCA MOVIL',
        fecha: '10/07/2026',
        horaInicio: '02:00:00',
        horaFin: '02:18:00',
        tiempoServicioAbajo: '00:18:00',
        indicador: 'II-PROGRAMADA',
        motivo: 'Ventana de mantenimiento',
        durationMinutes: 18,
        durationSeconds: 18 * 60
      },
      {
        id: '2',
        sistema: 'BANCA MOVIL',
        fecha: '15/07/2026',
        horaInicio: '14:00:00',
        horaFin: '22:25:00',
        tiempoServicioAbajo: '08:25:00',
        indicador: 'II-FALLAS',
        motivo: 'Intermitencia de base de datos',
        durationMinutes: 505,
        durationSeconds: 505 * 60
      }
    ]

    const report = calculateUptimeMetrics(julyEvents, 2026, 7)

    expect(report.daysInMonth).toBe(31)
    const bancaMovil = report.systems.find(s => s.sistema === 'BANCA MOVIL')
    expect(bancaMovil).toBeDefined()
    // 18m + 505m = 523m = 8 hours 43 minutes
    expect(bancaMovil?.totalDowntimeMinutes).toBe(523)
    expect(bancaMovil?.totalDowntimeFormatted).toBe('08:43:00')
    expect(bancaMovil?.indicators.programada.formattedTime).toBe('00:18')
    expect(bancaMovil?.indicators.programada.formattedPercent).toBe('0,0403%')
    expect(bancaMovil?.indicators.fallas.formattedTime).toBe('08:25')
    expect(bancaMovil?.indicators.fallas.formattedPercent).toBe('1,1313%')
    expect(bancaMovil?.downtimePercentFormatted).toBe('1,1716%')
    expect(bancaMovil?.uptimePercentFormatted).toBe('98,8284%')
  })

  it('matches EXACT calculations from the March 2026 PDF Report (GNS.SGT.013.2026)', () => {
    const marchEvents: RawEventRecord[] = [
      // CORE T24
      { id: '1', sistema: 'CORE T24', fecha: '25/03/2026', horaInicio: '22:31:00', horaFin: '23:05:00', tiempoServicioAbajo: '00:34:00', indicador: 'II-FALLAS', motivo: 'Contención BD', durationMinutes: 34, durationSeconds: 2040 },
      // BANCA MOVIL
      { id: '2', sistema: 'BANCA MOVIL', fecha: '04/03/2026', horaInicio: '13:12:00', horaFin: '13:36:00', tiempoServicioAbajo: '00:24:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 24, durationSeconds: 1440 },
      { id: '3', sistema: 'BANCA MOVIL', fecha: '06/03/2026', horaInicio: '17:46:00', horaFin: '18:12:00', tiempoServicioAbajo: '00:26:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 26, durationSeconds: 1560 },
      { id: '4', sistema: 'BANCA MOVIL', fecha: '12/03/2026', horaInicio: '01:01:00', horaFin: '01:13:00', tiempoServicioAbajo: '00:12:00', indicador: 'II-PROGRAMADA', motivo: 'Mantenimiento', durationMinutes: 12, durationSeconds: 720 },
      { id: '5', sistema: 'BANCA MOVIL', fecha: '17/03/2026', horaInicio: '02:12:00', horaFin: '02:25:00', tiempoServicioAbajo: '00:13:00', indicador: 'II-PROGRAMADA', motivo: 'Mantenimiento', durationMinutes: 13, durationSeconds: 780 },
      { id: '6', sistema: 'BANCA MOVIL', fecha: '21/03/2026', horaInicio: '15:58:00', horaFin: '16:39:00', tiempoServicioAbajo: '00:41:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 41, durationSeconds: 2460 },
      { id: '7', sistema: 'BANCA MOVIL', fecha: '29/03/2026', horaInicio: '03:48:00', horaFin: '04:26:00', tiempoServicioAbajo: '00:38:00', indicador: 'II-PROGRAMADA', motivo: 'Ajustes', durationMinutes: 38, durationSeconds: 2280 },
      // ACH
      { id: '8', sistema: 'ACH', fecha: '03/03/2026', horaInicio: '15:05:00', horaFin: '16:45:00', tiempoServicioAbajo: '01:40:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 100, durationSeconds: 6000 },
      { id: '9', sistema: 'ACH', fecha: '03/03/2026', horaInicio: '17:10:00', horaFin: '17:28:00', tiempoServicioAbajo: '00:18:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 18, durationSeconds: 1080 },
      { id: '10', sistema: 'ACH', fecha: '04/03/2026', horaInicio: '12:39:00', horaFin: '13:52:00', tiempoServicioAbajo: '01:13:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 73, durationSeconds: 4380 },
      { id: '11', sistema: 'ACH', fecha: '06/03/2026', horaInicio: '16:36:00', horaFin: '18:38:00', tiempoServicioAbajo: '02:02:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 122, durationSeconds: 7320 },
      { id: '12', sistema: 'ACH', fecha: '06/03/2026', horaInicio: '16:39:00', horaFin: '17:11:00', tiempoServicioAbajo: '00:32:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 32, durationSeconds: 1920 },
      { id: '13', sistema: 'ACH', fecha: '06/03/2026', horaInicio: '17:45:00', horaFin: '18:13:00', tiempoServicioAbajo: '00:28:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 28, durationSeconds: 1680 },
      { id: '14', sistema: 'ACH', fecha: '08/03/2026', horaInicio: '04:09:00', horaFin: '04:39:00', tiempoServicioAbajo: '00:30:00', indicador: 'II-PROGRAMADA', motivo: 'TakeOver', durationMinutes: 30, durationSeconds: 1800 },
      { id: '15', sistema: 'ACH', fecha: '08/03/2026', horaInicio: '06:48:00', horaFin: '07:12:00', tiempoServicioAbajo: '00:24:00', indicador: 'II-PROGRAMADA', motivo: 'TakeOver', durationMinutes: 24, durationSeconds: 1440 },
      { id: '16', sistema: 'ACH', fecha: '08/03/2026', horaInicio: '06:51:00', horaFin: '07:08:00', tiempoServicioAbajo: '00:17:00', indicador: 'II-PROGRAMADA', motivo: 'TakeOver', durationMinutes: 17, durationSeconds: 1020 },
      { id: '17', sistema: 'ACH', fecha: '10/03/2026', horaInicio: '00:14:00', horaFin: '00:30:00', tiempoServicioAbajo: '00:16:00', indicador: 'II-PROGRAMADA', motivo: 'Ajustes', durationMinutes: 16, durationSeconds: 960 },
      { id: '18', sistema: 'ACH', fecha: '14/03/2026', horaInicio: '21:26:00', horaFin: '22:16:00', tiempoServicioAbajo: '00:50:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 50, durationSeconds: 3000 },
      { id: '19', sistema: 'ACH', fecha: '16/03/2026', horaInicio: '23:01:00', horaFin: '23:41:00', tiempoServicioAbajo: '00:40:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 40, durationSeconds: 2400 },
      { id: '20', sistema: 'ACH', fecha: '21/03/2026', horaInicio: '15:53:00', horaFin: '16:40:00', tiempoServicioAbajo: '00:47:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 47, durationSeconds: 2820 },
      { id: '21', sistema: 'ACH', fecha: '25/03/2026', horaInicio: '23:05:00', horaFin: '23:59:00', tiempoServicioAbajo: '00:54:00', indicador: 'II-PROGRAMADA', motivo: 'Mantenimiento', durationMinutes: 54, durationSeconds: 3240 },
      { id: '22', sistema: 'ACH', fecha: '29/03/2026', horaInicio: '03:45:00', horaFin: '04:59:00', tiempoServicioAbajo: '01:14:00', indicador: 'II-PROGRAMADA', motivo: 'Ajustes', durationMinutes: 74, durationSeconds: 4440 },
      // POSTILION
      { id: '23', sistema: 'POSTILION', fecha: '04/03/2026', horaInicio: '13:13:00', horaFin: '13:42:00', tiempoServicioAbajo: '00:29:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 29, durationSeconds: 1740 },
      { id: '24', sistema: 'POSTILION', fecha: '07/03/2026', horaInicio: '05:34:00', horaFin: '05:56:00', tiempoServicioAbajo: '00:22:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 22, durationSeconds: 1320 },
      { id: '25', sistema: 'POSTILION', fecha: '08/03/2026', horaInicio: '05:10:00', horaFin: '05:56:00', tiempoServicioAbajo: '00:46:00', indicador: 'II-PROGRAMADA', motivo: 'TakeOver', durationMinutes: 46, durationSeconds: 2760 },
      { id: '26', sistema: 'POSTILION', fecha: '09/03/2026', horaInicio: '05:29:00', horaFin: '05:56:00', tiempoServicioAbajo: '00:27:00', indicador: 'II-PROGRAMADA', motivo: 'Ajustes', durationMinutes: 27, durationSeconds: 1620 },
      { id: '27', sistema: 'POSTILION', fecha: '10/03/2026', horaInicio: '16:45:00', horaFin: '17:10:00', tiempoServicioAbajo: '00:25:00', indicador: 'II-FALLAS', motivo: 'Estabilización', durationMinutes: 25, durationSeconds: 1500 }
    ]

    const report = calculateUptimeMetrics(marchEvents, 2026, 3)

    // Verify Days in March
    expect(report.daysInMonth).toBe(31)
    expect(report.totalMonthHours).toBe(744)
    expect(report.totalMonthMinutes).toBe(44640)

    // 1. CORE T24
    const t24 = report.systems.find(s => s.sistema === 'CORE T24')!
    expect(t24.totalDowntimeFormatted).toBe('00:34:00')
    expect(t24.downtimePercentFormatted).toBe('0,0762%')
    expect(t24.uptimePercentFormatted).toBe('99,9238%')
    expect(t24.indicators.fallas.formattedPercent).toBe('0,0762%')

    // 2. FISA (0 caídas)
    const fisa = report.systems.find(s => s.sistema === 'FISA')!
    expect(fisa.uptimePercentFormatted).toBe('100,0000%')
    expect(fisa.downtimePercentFormatted).toBe('0,0000%')

    // 3. ICBANKING (0 caídas)
    const icbanking = report.systems.find(s => s.sistema === 'ICBANKING')!
    expect(icbanking.uptimePercentFormatted).toBe('100,0000%')

    // 4. BANCA MOVIL
    const bm = report.systems.find(s => s.sistema === 'BANCA MOVIL')!
    expect(bm.totalDowntimeFormatted).toBe('02:34:00')
    expect(bm.downtimePercentFormatted).toBe('0,3450%')
    expect(bm.uptimePercentFormatted).toBe('99,6550%')
    expect(bm.indicators.programada.formattedPercent).toBe('0,1411%')
    expect(bm.indicators.fallas.formattedPercent).toBe('0,2039%')

    // 5. PORTAL WEB (0 caídas)
    const portal = report.systems.find(s => s.sistema === 'PORTAL WEB')!
    expect(portal.uptimePercentFormatted).toBe('100,0000%')

    // 6. POSTILION
    const postilion = report.systems.find(s => s.sistema === 'POSTILION')!
    expect(postilion.totalDowntimeFormatted).toBe('02:29:00')
    expect(postilion.downtimePercentFormatted).toBe('0,3338%')
    expect(postilion.uptimePercentFormatted).toBe('99,6662%')
    expect(postilion.indicators.programada.formattedPercent).toBe('0,1635%')
    expect(postilion.indicators.fallas.formattedPercent).toBe('0,1703%')

    // 7. ACH
    const ach = report.systems.find(s => s.sistema === 'ACH')!
    expect(ach.totalDowntimeFormatted).toBe('12:05:00')
    expect(ach.downtimePercentFormatted).toBe('1,6241%')
    expect(ach.uptimePercentFormatted).toBe('98,3759%')
    expect(ach.indicators.programada.formattedPercent).toBe('0,4816%')
    expect(ach.indicators.fallas.formattedPercent).toBe('1,1425%')

    // 8. ONBASE & 9. SWIFT
    expect(report.systems.find(s => s.sistema === 'ONBASE')!.uptimePercentFormatted).toBe('100,0000%')
    expect(report.systems.find(s => s.sistema === 'SWIFT')!.uptimePercentFormatted).toBe('100,0000%')

    // PROMEDIO FINAL (Summary row on Page 4 of PDF)
    expect(report.summary.averageUptimeFormatted).toBe('99,7357%')
    expect(report.summary.averageProveedorFormatted).toBe('0,0000%')
    expect(report.summary.averageProgramadaFormatted).toBe('0,0874%')
    expect(report.summary.averageFallasFormatted).toBe('0,1770%')
    expect(report.summary.averageTotalDowntimeFormatted).toBe('0,2643%')
  })
})

