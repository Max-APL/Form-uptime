import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { NetworkEventRecord } from '../types/networkUptime'

export async function exportNetworkEventsToExcel(
  records: NetworkEventRecord[],
  year: number,
  monthName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Banco Mercantil Santa Cruz'
  workbook.lastModifiedBy = 'BMSC Operaciones TI'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Enlaces de Red', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
  })

  // 1. Title Banner
  sheet.mergeCells('A1:G1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = `BANCO MERCANTIL SANTA CRUZ — UPTIME DE ENLACES DE RED (${monthName.toUpperCase()} ${year})`
  titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF004D2C' } // BMSC Dark Green
  }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 30

  // 2. Subtitle / Metadata
  sheet.mergeCells('A2:G2')
  const subCell = sheet.getCell('A2')
  subCell.value = `Reporte operativo oficial de disponibilidad de telecomunicaciones, agencias y cajeros automáticos | Total Registros: ${records.length}`
  subCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } }
  subCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(2).height = 20

  sheet.getRow(3).height = 10 // spacing row

  // 3. Table Column Headers
  const headers = [
    'N°',
    'FECHA REFERENCIA',
    'TIPO DE ENLACE',
    'DEPARTAMENTO',
    'DETALLE / NOMBRE (PROVEEDOR / AGENCIA / NOMBRE)',
    'UPTIME MENSUAL (%)',
    'UPTIME ANUAL (%)'
  ]

  const headerRow = sheet.getRow(4)
  headerRow.values = headers
  headerRow.height = 25
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark Slate
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    }
  })

  // 4. Populate Data Rows
  records.forEach((rec, idx) => {
    const row = sheet.addRow([
      idx + 1,
      rec.fecha || '',
      rec.enlace || '',
      rec.departamento || '',
      rec.nombre || '',
      rec.uptimeMensual / 100, // as decimal for Excel percentage formatting
      rec.uptimeAnual / 100
    ])

    const isEven = idx % 2 === 0
    row.height = 20

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      }

      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        }
      }

      // Specific column alignments & formats
      if (colNumber === 1 || colNumber === 2 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      } else if (colNumber === 6 || colNumber === 7) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        cell.numFmt = '0.0000%'
        cell.font = { name: 'Arial', size: 9, bold: true }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
      }
    })
  })

  // Column Widths
  sheet.columns = [
    { key: 'num', width: 6 },
    { key: 'fecha', width: 18 },
    { key: 'enlace', width: 28 },
    { key: 'depto', width: 18 },
    { key: 'nombre', width: 38 },
    { key: 'mensual', width: 20 },
    { key: 'anual', width: 20 }
  ]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  saveAs(blob, `BMSC_Uptime_Redes_${monthName}_${year}.xlsx`)
}
