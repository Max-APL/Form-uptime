import { describe, it, expect, vi } from 'vitest'
import ExcelJS from 'exceljs'
import { parseNetworkExcelBuffer } from '../../src/utils/networkExcelParser'
import { parseExcelBuffer } from '../../src/utils/excelParser'
import {
  downloadIncidentTemplate,
  downloadNetworkTemplate,
  generateIncidentTemplateWorkbook,
  generateNetworkTemplateWorkbook
} from '../../src/utils/templateDownloader'

// Mock file-saver saveAs
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}))

describe('Network Excel Parser and Template Downloader', () => {
  it('parses network Excel file with standard headers correctly', async () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Disponibilidad')

    sheet.addRow(['TIPO DE ENLACE', 'CIUDAD / DEPARTAMENTO', 'NOMBRE', 'UPTIME MENSUAL (%)', 'UPTIME ANUAL (%)'])
    sheet.addRow(['ENLACES WAN NACIONAL', 'LA PAZ', 'ENTEL WAN', '99.9850%', '99.9990%'])
    sheet.addRow(['ENLACES AGENCIAS NACIONAL', 'RIBERALTA', 'AGENCIA RIBERALTA', '100%', '100%'])
    sheet.addRow(['ENLACES ATMS NACIONAL', 'SANTA CRUZ', 'ATM CENTRAL', '99.90%', '99.95%'])

    const buffer = await workbook.xlsx.writeBuffer()
    const result = await parseNetworkExcelBuffer(buffer)

    expect(result.rowCount).toBe(3)
    expect(result.records).toHaveLength(3)

    expect(result.records[0].enlace).toBe('ENLACES WAN NACIONAL')
    expect(result.records[0].departamento).toBe('LA PAZ')
    expect(result.records[0].nombre).toBe('ENTEL WAN')
    expect(result.records[0].uptimeMensual).toBe(99.985)
    expect(result.records[0].uptimeAnual).toBe(99.999)

    expect(result.records[1].departamento).toBe('RIBERALTA')
    expect(result.records[1].nombre).toBe('AGENCIA RIBERALTA')
    expect(result.records[1].uptimeMensual).toBe(100)

    expect(result.records[2].departamento).toBe('SANTA CRUZ')
    expect(result.records[2].nombre).toBe('ATM CENTRAL')
    expect(result.records[2].uptimeMensual).toBe(99.9)
  })

  it('generates and parses network template with exactly 1 example row and detects ciudad/depto', async () => {
    const workbook = await generateNetworkTemplateWorkbook()
    const buffer = await workbook.xlsx.writeBuffer()

    const result = await parseNetworkExcelBuffer(buffer)

    // Debe contener exactamente 1 registro de ejemplo
    expect(result.rowCount).toBe(1)
    expect(result.records).toHaveLength(1)

    const rec = result.records[0]
    expect(rec.enlace).toBe('ENLACES WAN NACIONAL')
    expect(rec.departamento).toBe('LA PAZ') // Valida que detectó la ciudad/departamento correctamente
    expect(rec.nombre).toContain('ENTEL')
    expect(rec.uptimeMensual).toBe(99.985)
    expect(rec.uptimeAnual).toBe(99.999)
  })

  it('generates and parses incident template with exactly 1 example row', async () => {
    const workbook = await generateIncidentTemplateWorkbook()
    const buffer = await workbook.xlsx.writeBuffer()

    const result = await parseExcelBuffer(buffer)

    // Debe contener exactamente 1 registro de ejemplo
    expect(result.rowCount).toBe(1)
    expect(result.events).toHaveLength(1)

    const ev = result.events[0]
    expect(ev.sistema).toBe('BANCA MOVIL')
    expect(ev.indicador).toBe('II-FALLAS')
    expect(ev.durationMinutes).toBe(45)
  })

  it('generates and triggers download for incident template', async () => {
    const { saveAs } = await import('file-saver')
    await downloadIncidentTemplate()
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'BMSC_Plantilla_Importacion_Incidentes.xlsx')
  })

  it('generates and triggers download for network template', async () => {
    const { saveAs } = await import('file-saver')
    await downloadNetworkTemplate()
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'BMSC_Plantilla_Importacion_Redes.xlsx')
  })
})
