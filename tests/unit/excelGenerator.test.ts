import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { generateUptimeWorkbook, generateEmptyTemplateWorkbook } from '../../src/utils/excelGenerator'
import { calculateUptimeMetrics } from '../../src/utils/calculator'
import { SAMPLE_JUNE_EVENTS } from '../../src/utils/sampleData'

describe('Excel Generator Tests', () => {
  it('generates a valid multi-sheet workbook with individual system sheets and Resumen General', async () => {
    const report = calculateUptimeMetrics(SAMPLE_JUNE_EVENTS, 2026, 6)
    const blob = await generateUptimeWorkbook(report)

    expect(blob.size).toBeGreaterThan(1000)

    // Load back with ExcelJS to inspect sheets and cells
    const arrayBuffer = await blob.arrayBuffer()
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(arrayBuffer)

    // Check sheets
    const sheetNames = wb.worksheets.map(ws => ws.name)
    expect(sheetNames).toContain('CORE T24')
    expect(sheetNames).toContain('POSTILION')
    expect(sheetNames).toContain('Resumen General')

    // Inspect CORE T24 sheet
    const t24Sheet = wb.getWorksheet('CORE T24')
    expect(t24Sheet).toBeDefined()
    expect(t24Sheet?.getCell('A1').value).toBe('CORE T24')
    expect(t24Sheet?.getCell('A3').value).toBe('FECHA')

    // Inspect Resumen General sheet
    const genSheet = wb.getWorksheet('Resumen General')
    expect(genSheet).toBeDefined()
    expect(genSheet?.getCell('A1').value).toBe('Resumen Final de UPTIME de Sistemas Críticos del BMSC')
  })

  it('generates an empty template workbook with the 7 standard columns', async () => {
    const blob = await generateEmptyTemplateWorkbook()
    expect(blob.size).toBeGreaterThan(500)

    const arrayBuffer = await blob.arrayBuffer()
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(arrayBuffer)

    const ws = wb.worksheets[0]
    expect(ws.getCell('A1').value).toBe('SISTEMA')
    expect(ws.getCell('B1').value).toBe('FECHA')
    expect(ws.getCell('C1').value).toBe('HORA DE INICIO CAIDA')
    expect(ws.getCell('D1').value).toBe('HORA DE FIN CAIDA')
    expect(ws.getCell('E1').value).toBe('TIEMPO SERVICIO ABAJO')
    expect(ws.getCell('F1').value).toBe('INDICADOR')
    expect(ws.getCell('G1').value).toBe('MOTIVO')
  })
})
