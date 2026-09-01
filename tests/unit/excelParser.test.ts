import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parseExcelBuffer } from '../../src/utils/excelParser'

describe('Excel Parser Unit Tests', () => {
  it('parses an in-memory workbook with custom headers and extracts events and dates', async () => {
    const wsData = [
      ['SISTEMA', 'FECHA', 'HORA DE INICIO CAIDA', 'HORA DE FIN CAIDA', 'TIEMPO SERVICIO ABAJO', 'INDICADOR', 'MOTIVO'],
      ['CORE T24', 'jueves, 18 de junio de 2026', '10:25:00 a. m.', '11:06:00 a. m.', '00:41:00', 'II-FALLAS', 'Problemas en inicios de sesión'],
      ['ACH', '18/06/2026', '01:00:00', '01:58:00', '00:58:00', 'II-PROGRAMADA', 'Mantenimiento'],
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos')

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const res = await parseExcelBuffer(buf)

    expect(res.events.length).toBe(2)
    expect(res.detectedMonth).toBe(6)
    expect(res.detectedYear).toBe(2026)
    expect(res.detectedPeriods).toEqual([{ month: 6, year: 2026, count: 2 }])
    expect(res.events[0].sistema).toBe('CORE T24')
    expect(res.events[0].durationMinutes).toBe(41)
    expect(res.events[0].indicador).toBe('II-FALLAS')
    expect(res.events[1].sistema).toBe('ACH')
    expect(res.events[1].durationMinutes).toBe(58)
    expect(res.events[1].indicador).toBe('II-PROGRAMADA')
  })

  it('reports every detected period when the file mixes months', async () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['SISTEMA', 'FECHA', 'TIEMPO SERVICIO ABAJO', 'INDICADOR'],
      ['CORE T24', '18/06/2026', '00:10:00', 'II-FALLAS'],
      ['ACH', '02/07/2026', '00:05:00', 'II-FALLAS'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos')

    const res = await parseExcelBuffer(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }))

    expect(res.detectedPeriods).toHaveLength(2)
    expect(res.detectedPeriods).toEqual(expect.arrayContaining([
      { month: 6, year: 2026, count: 1 },
      { month: 7, year: 2026, count: 1 },
    ]))
  })
})
