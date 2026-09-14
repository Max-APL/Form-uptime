import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { parseExcelBuffer } from '../../src/utils/excelParser'

describe('Excel Parser Unit Tests', () => {
  it('parses an in-memory workbook with custom headers and extracts events and dates', async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Eventos')
    worksheet.addRow(['SISTEMA', 'FECHA', 'HORA DE INICIO CAIDA', 'HORA DE FIN CAIDA', 'TIEMPO SERVICIO ABAJO', 'INDICADOR', 'MOTIVO'])
    worksheet.addRow(['CORE T24', 'jueves, 18 de junio de 2026', '10:25:00 a. m.', '11:06:00 a. m.', '00:41:00', 'II-FALLAS', 'Problemas en inicios de sesión'])
    worksheet.addRow(['ACH', '18/06/2026', '01:00:00', '01:58:00', '00:58:00', 'II-PROGRAMADA', 'Mantenimiento'])

    const buf = await workbook.xlsx.writeBuffer()
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
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Eventos')
    worksheet.addRow(['SISTEMA', 'FECHA', 'TIEMPO SERVICIO ABAJO', 'INDICADOR'])
    worksheet.addRow(['CORE T24', '18/06/2026', '00:10:00', 'II-FALLAS'])
    worksheet.addRow(['ACH', '02/07/2026', '00:05:00', 'II-FALLAS'])

    const buf = await workbook.xlsx.writeBuffer()
    const res = await parseExcelBuffer(buf)

    expect(res.detectedPeriods).toHaveLength(2)
    expect(res.detectedPeriods).toEqual(expect.arrayContaining([
      { month: 6, year: 2026, count: 1 },
      { month: 7, year: 2026, count: 1 },
    ]))
  })

  it('parses real eventos agosto.xlsx file', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const fileBuf = fs.readFileSync(path.resolve(__dirname, '../../eventos agosto.xlsx'))
    const res = await parseExcelBuffer(fileBuf)
    console.log('REAL AGOSTO RESULT:', {
      detectedMonth: res.detectedMonth,
      detectedYear: res.detectedYear,
      detectedPeriods: res.detectedPeriods,
      warnings: res.warnings,
      dates: res.events.map(e => e.fecha)
    })
    expect(res.detectedMonth).toBe(8)
    expect(res.detectedPeriods).toHaveLength(1)
  })
})
