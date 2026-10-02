import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { AchStatisticRecord } from '../types/achStatistics'

export async function exportAchStatisticsToExcel(
  records: AchStatisticRecord[],
  year: number,
  monthName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Banco Mercantil Santa Cruz'
  workbook.lastModifiedBy = 'BMSC Operaciones ACH'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Estadísticas ACH', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }]
  })

  // 1. Title Banner
  sheet.mergeCells('A1:I1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = `BANCO MERCANTIL SANTA CRUZ — ESTADÍSTICAS ACH Y MLD (${monthName.toUpperCase()} ${year})`
  titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF004D2C' } // BMSC Dark Green
  }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 30

  // 2. Subtitle / Metadata
  sheet.mergeCells('A2:I2')
  const subCell = sheet.getCell('A2')
  subCell.value = `Control de transacciones interbancarias, resolución de caídas y conciliación MLD Banco Central | Total Registros: ${records.length}`
  subCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } }
  subCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(2).height = 20

  sheet.getRow(3).height = 8 // spacing row

  // 3. Category Group Headers (Row 4)
  sheet.mergeCells('A4:B4')
  sheet.getCell('A4').value = 'DATOS GENERALES'
  sheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
  sheet.getCell('A4').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' }

  sheet.mergeCells('C4:E4')
  sheet.getCell('C4').value = 'TRANSACCIONES ACH'
  sheet.getCell('C4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004D2C' } }
  sheet.getCell('C4').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' }

  sheet.mergeCells('F4:H4')
  sheet.getCell('F4').value = 'BANCO CENTRAL (MLD)'
  sheet.getCell('F4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } } // Navy Blue
  sheet.getCell('F4').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getCell('F4').alignment = { horizontal: 'center', vertical: 'middle' }

  sheet.getCell('I4').value = 'CONTROL'
  sheet.getCell('I4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
  sheet.getCell('I4').font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getCell('I4').alignment = { horizontal: 'center', vertical: 'middle' }

  sheet.getRow(4).height = 20

  // 4. Column Headers (Row 5)
  const headers = [
    'N°',
    'FECHA',
    'TIPO',
    'CANTIDAD',
    'MONTO (BS.)',
    'TIPO MLD',
    'CANTIDAD MLD',
    'MONTO MLD (BS.)',
    'REVISIÓN'
  ]

  const headerRow = sheet.getRow(5)
  headerRow.values = headers
  headerRow.height = 24
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    let bg = 'FF1E293B'
    if (colNumber >= 3 && colNumber <= 5) bg = 'FF065F46' // Emerald
    if (colNumber >= 6 && colNumber <= 8) bg = 'FF1E40AF' // Blue
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      right: { style: 'thin', color: { argb: 'FF475569' } }
    }
  })

  // 5. Populate Data Rows
  let totalCant = 0
  let totalMonto = 0
  let totalCantMld = 0
  let totalMontoMld = 0

  records.forEach((rec, idx) => {
    const row = sheet.addRow([
      idx + 1,
      rec.fecha || '',
      rec.tipo || '',
      rec.cantidad || 0,
      rec.monto || 0,
      rec.tipoMld || '',
      rec.cantidadMld || 0,
      rec.montoMld || 0,
      rec.revision ? 'REVISADO' : 'PENDIENTE'
    ])

    totalCant += rec.cantidad || 0
    totalMonto += rec.monto || 0
    totalCantMld += rec.cantidadMld || 0
    totalMontoMld += rec.montoMld || 0

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

      // Column Specific Alignments & Formats
      if (colNumber === 1 || colNumber === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      } else if (colNumber === 3 || colNumber === 6) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
        cell.font = { name: 'Arial', size: 9, bold: true }
      } else if (colNumber === 4 || colNumber === 7) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        cell.numFmt = '#,##0'
        cell.font = { name: 'Arial', size: 9, bold: true }
      } else if (colNumber === 5 || colNumber === 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        cell.numFmt = '#,##0.00'
        cell.font = { name: 'Arial', size: 9, bold: true }
      } else if (colNumber === 9) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: rec.revision ? 'FF004D2C' : 'FFB45309' } }
      }
    })
  })

  // 6. Summary Totals Row
  const totalRow = sheet.addRow([
    '',
    'TOTALES:',
    '',
    totalCant,
    totalMonto,
    '',
    totalCantMld,
    totalMontoMld,
    ''
  ])
  totalRow.height = 24
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } }
    }
    if (colNumber === 4 || colNumber === 7) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
      cell.numFmt = '#,##0'
    } else if (colNumber === 5 || colNumber === 8) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
      cell.numFmt = '#,##0.00'
    } else if (colNumber === 2) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    }
  })

  // Column Widths
  sheet.columns = [
    { key: 'num', width: 6 },
    { key: 'fecha', width: 14 },
    { key: 'tipo', width: 26 },
    { key: 'cantidad', width: 16 },
    { key: 'monto', width: 22 },
    { key: 'tipoMld', width: 26 },
    { key: 'cantidadMld', width: 16 },
    { key: 'montoMld', width: 22 },
    { key: 'revision', width: 15 }
  ]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  saveAs(blob, `BMSC_ACH_Estadisticas_${monthName}_${year}.xlsx`)
}
