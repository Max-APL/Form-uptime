import ExcelJS from 'exceljs'
import type { ConsolidatedReport } from '../types/uptime'
import { formatPercentSpanish } from './calculator'

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
}

const FILL_DARK_GRAY: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF7F7F7F' }
}

const FILL_SUBHEADER_GRAY: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9D9D9' }
}

const FILL_LIGHT_GRAY: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE6E6E6' }
}

const FILL_BLACK: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF000000' }
}

const FILL_LIGHT_GREEN: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9EAD3' }
}

/**
 * Applies thin border and alignment to a cell.
 */
function styleCell(
  cell: ExcelJS.Cell,
  options: {
    font?: Partial<ExcelJS.Font>
    fill?: ExcelJS.Fill
    alignment?: Partial<ExcelJS.Alignment>
    borders?: Partial<ExcelJS.Borders>
  }
) {
  if (options.font) cell.font = options.font
  if (options.fill) cell.fill = options.fill
  if (options.alignment) cell.alignment = options.alignment
  cell.border = options.borders || BORDER_THIN
}

/**
 * Builds the Excel workbook with one sheet per system + general summary sheet with the 2 consolidated tables.
 */
export async function generateUptimeWorkbook(report: ConsolidatedReport): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema de Uptime BMSC'
  workbook.lastModifiedBy = 'Sistema de Uptime BMSC'
  workbook.created = new Date()
  workbook.modified = new Date()

  // 1. Create Individual Sheets for Each System
  for (const sys of report.systems) {
    // Sheet names max 31 chars and no illegal chars: \ / ? * [ ] :
    const cleanSheetName = sys.sistema.replace(/[\/\\\?\*\[\]:]/g, '_').substring(0, 31)
    const ws = workbook.addWorksheet(cleanSheetName, {
      views: [{ showGridLines: true }]
    })

    // Set column widths
    ws.columns = [
      { width: 28 }, // FECHA
      { width: 22 }, // HORA INICIO
      { width: 22 }, // HORA FIN
      { width: 24 }, // TIEMPO SERVICIO ABAJO
      { width: 20 }, // INDICADOR
      { width: 60 }  // MOTIVO
    ]

    // Row 1: System Title (Bold, Underlined)
    const titleRow = ws.getRow(1)
    titleRow.height = 24
    const cellA1 = ws.getCell('A1')
    cellA1.value = sys.sistema.toUpperCase()
    cellA1.font = { name: 'Arial', size: 14, bold: true, underline: true }

    // Row 2: Subheader banner (merged A2:F2 or A2)
    const subheaderRow = ws.getRow(2)
    subheaderRow.height = 20
    ws.mergeCells('A2:F2')
    const subheaderCell = ws.getCell('A2')
    subheaderCell.value = sys.sistema.toUpperCase()
    styleCell(subheaderCell, {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } },
      fill: FILL_SUBHEADER_GRAY,
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
    // Apply borders to merged row
    for (let c = 1; c <= 6; c++) {
      ws.getRow(2).getCell(c).border = BORDER_THIN
    }

    // Row 3: Event headers
    const headerRow = ws.getRow(3)
    headerRow.height = 24
    const headers = [
      'FECHA',
      'HORA DE INICIO CAIDA',
      'HORA DE FIN CAIDA',
      'TIEMPO SERVICIO ABAJO',
      'INDICADOR',
      'MOTIVO'
    ]

    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1)
      cell.value = h
      styleCell(cell, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } },
        fill: FILL_DARK_GRAY,
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
      })
    })

    // Data rows
    let currentRow = 4
    if (sys.events.length > 0) {
      for (const ev of sys.events) {
        const row = ws.getRow(currentRow)
        row.height = 22

        const c1 = row.getCell(1)
        c1.value = ev.fecha
        styleCell(c1, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'left', vertical: 'middle' } })

        const c2 = row.getCell(2)
        c2.value = ev.horaInicio
        styleCell(c2, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

        const c3 = row.getCell(3)
        c3.value = ev.horaFin
        styleCell(c3, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

        const c4 = row.getCell(4)
        c4.value = ev.tiempoServicioAbajo
        styleCell(c4, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

        const c5 = row.getCell(5)
        c5.value = ev.indicador
        styleCell(c5, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

        const c6 = row.getCell(6)
        c6.value = ev.motivo
        styleCell(c6, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'left', vertical: 'middle', wrapText: true } })

        currentRow++
      }
    } else {
      // Empty row with borders when system has no incidents
      const emptyRow = ws.getRow(currentRow)
      emptyRow.height = 20
      for (let c = 1; c <= 6; c++) {
        const cell = emptyRow.getCell(c)
        cell.value = ''
        styleCell(cell, { font: { name: 'Arial', size: 10 } })
      }
      currentRow++
    }

    // Summary table below events
    // Row: Total Downtime en horas (HH:MI:SS)
    const sumRow1 = ws.getRow(currentRow)
    sumRow1.height = 20
    ws.mergeCells(`A${currentRow}:C${currentRow}`)
    const labelDowntime = ws.getCell(`A${currentRow}`)
    labelDowntime.value = 'Total Downtime en horas (HH:MI:SS)'
    styleCell(labelDowntime, {
      font: { name: 'Arial', size: 10, bold: true },
      fill: FILL_SUBHEADER_GRAY,
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
    for (let c = 1; c <= 3; c++) {
      sumRow1.getCell(c).border = BORDER_THIN
    }
    const valDowntime = sumRow1.getCell(4)
    valDowntime.value = sys.totalDowntimeFormatted
    styleCell(valDowntime, {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++

    // Row: % DOWNTIME
    const sumRow2 = ws.getRow(currentRow)
    sumRow2.height = 20
    ws.mergeCells(`B${currentRow}:C${currentRow}`)
    const labelPctDowntime = ws.getCell(`B${currentRow}`)
    labelPctDowntime.value = '% DOWNTIME'
    styleCell(labelPctDowntime, {
      font: { name: 'Arial', size: 10, bold: true },
      fill: FILL_LIGHT_GRAY,
      alignment: { horizontal: 'right', vertical: 'middle' }
    })
    for (let c = 2; c <= 3; c++) {
      sumRow2.getCell(c).border = BORDER_THIN
    }
    const valPctDowntime = sumRow2.getCell(4)
    valPctDowntime.value = formatPercentSpanish(sys.downtimePercent)
    styleCell(valPctDowntime, {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++

    // Row: % UPTIME
    const sumRow3 = ws.getRow(currentRow)
    sumRow3.height = 20
    ws.mergeCells(`B${currentRow}:C${currentRow}`)
    const labelPctUptime = ws.getCell(`B${currentRow}`)
    labelPctUptime.value = '% UPTIME'
    styleCell(labelPctUptime, {
      font: { name: 'Arial', size: 10, bold: true },
      fill: FILL_LIGHT_GRAY,
      alignment: { horizontal: 'right', vertical: 'middle' }
    })
    for (let c = 2; c <= 3; c++) {
      sumRow3.getCell(c).border = BORDER_THIN
    }
    const valPctUptime = sumRow3.getCell(4)
    valPctUptime.value = formatPercentSpanish(sys.uptimePercent)
    styleCell(valPctUptime, {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
    currentRow++

    // Row: % TOTAL
    const sumRow4 = ws.getRow(currentRow)
    sumRow4.height = 20
    ws.mergeCells(`B${currentRow}:C${currentRow}`)
    const labelPctTotal = ws.getCell(`B${currentRow}`)
    labelPctTotal.value = '% TOTAL'
    styleCell(labelPctTotal, {
      font: { name: 'Arial', size: 10, bold: true },
      fill: FILL_LIGHT_GRAY,
      alignment: { horizontal: 'right', vertical: 'middle' }
    })
    for (let c = 2; c <= 3; c++) {
      sumRow4.getCell(c).border = BORDER_THIN
    }
    const valPctTotal = sumRow4.getCell(4)
    valPctTotal.value = '100,0000%'
    styleCell(valPctTotal, {
      font: { name: 'Arial', size: 10, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
  }

  // 2. Create General / Summary Sheet (Containing the 2 Consolidated Tables)
  const generalWs = workbook.addWorksheet('Resumen General', {
    views: [{ showGridLines: true }]
  })

  generalWs.columns = [
    { width: 28 }, // Col A (SISTEMA)
    { width: 20 }, // Col B (JUNIO / TOTAL NO DISPONIBILIDAD)
    { width: 20 }, // Col C (II-PROVEEDOR / DISPONIBILIDAD %)
    { width: 22 }, // Col D (II-PROGRAMADA / PROVEEDOR tiempo)
    { width: 20 }, // Col E (II-FALLAS / PROVEEDOR %)
    { width: 22 }, // Col F (TOTAL / PROGRAMADA tiempo)
    { width: 20 }, // Col G (PROGRAMADA %)
    { width: 20 }, // Col H (FALLAS tiempo)
    { width: 20 }  // Col I (FALLAS %)
  ]

  let r = 1

  // ==========================================
  // TABLE 1: Resumen Final de UPTIME de Sistemas Críticos del BMSC
  // ==========================================
  const t1TitleRow = generalWs.getRow(r)
  t1TitleRow.height = 24
  const t1TitleCell = generalWs.getCell(`A${r}`)
  t1TitleCell.value = 'Resumen Final de UPTIME de Sistemas Críticos del BMSC'
  t1TitleCell.font = { name: 'Arial', size: 12, bold: true, underline: true }
  r++

  // Table 1 Headers (Black fill, White bold text)
  const t1HeaderRow = generalWs.getRow(r)
  t1HeaderRow.height = 24
  const t1Headers = [
    'SISTEMA',
    report.monthName,
    'II-PROVEEDOR',
    'II-PROGRAMADA',
    'II-FALLAS',
    'TOTAL'
  ]

  t1Headers.forEach((h, idx) => {
    const cell = t1HeaderRow.getCell(idx + 1)
    cell.value = h
    styleCell(cell, {
      font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: FILL_BLACK,
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
  })
  r++

  // Table 1 Data rows
  for (const sys of report.systems) {
    const row = generalWs.getRow(r)
    row.height = 20

    const c1 = row.getCell(1)
    c1.value = sys.sistema
    styleCell(c1, { font: { name: 'Arial', size: 10, bold: true }, alignment: { horizontal: 'left', vertical: 'middle' } })

    const c2 = row.getCell(2)
    c2.value = formatPercentSpanish(sys.uptimePercent)
    styleCell(c2, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c3 = row.getCell(3)
    c3.value = formatPercentSpanish(sys.indicators.proveedor.percent)
    styleCell(c3, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c4 = row.getCell(4)
    c4.value = formatPercentSpanish(sys.indicators.programada.percent)
    styleCell(c4, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c5 = row.getCell(5)
    c5.value = formatPercentSpanish(sys.indicators.fallas.percent)
    styleCell(c5, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c6 = row.getCell(6)
    c6.value = formatPercentSpanish(sys.downtimePercent)
    styleCell(c6, { font: { name: 'Arial', size: 10 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    r++
  }

  // Table 1 Footer: PROMEDIO FINAL (Black fill, White bold text)
  const t1FooterRow = generalWs.getRow(r)
  t1FooterRow.height = 22

  const footerValues = [
    'PROMEDIO FINAL',
    formatPercentSpanish(report.summary.averageUptime),
    formatPercentSpanish(report.summary.averageProveedor),
    formatPercentSpanish(report.summary.averageProgramada),
    formatPercentSpanish(report.summary.averageFallas),
    formatPercentSpanish(report.summary.averageTotalDowntime)
  ]

  footerValues.forEach((val, idx) => {
    const cell = t1FooterRow.getCell(idx + 1)
    cell.value = val
    styleCell(cell, {
      font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: FILL_BLACK,
      alignment: { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' }
    })
  })
  r += 4 // Space between tables

  // ==========================================
  // TABLE 2: REPORTE UPTIME DE TECNOLOGIA
  // ==========================================
  const t2TitleRow = generalWs.getRow(r)
  t2TitleRow.height = 22
  const t2TitleCell = generalWs.getCell(`A${r}`)
  t2TitleCell.value = 'REPORTE UPTIME DE TECNOLOGIA'
  t2TitleCell.font = { name: 'Arial', size: 12, bold: true, underline: true }
  r++

  // Month Indicator Row
  const t2MonthRow = generalWs.getRow(r)
  t2MonthRow.height = 20
  const mesLabelCell = generalWs.getCell(`B${r}`)
  mesLabelCell.value = 'MES:'
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true }
  mesLabelCell.alignment = { horizontal: 'right', vertical: 'middle' }

  const mesValCell = generalWs.getCell(`C${r}`)
  mesValCell.value = report.monthName
  mesValCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF004080' } }
  mesValCell.alignment = { horizontal: 'center', vertical: 'middle' }
  r++

  // Table 2 Multi-level Header (Light Green fill)
  const headerStartRow = r
  const headerEndRow = r + 1

  // Row 1: Merge columns A, B, C vertically, and D-I horizontally
  generalWs.mergeCells(`A${headerStartRow}:A${headerEndRow}`)
  const t2hA = generalWs.getCell(`A${headerStartRow}`)
  t2hA.value = 'SISTEMA'
  styleCell(t2hA, { font: { name: 'Arial', size: 10, bold: true }, fill: FILL_LIGHT_GREEN, alignment: { horizontal: 'center', vertical: 'middle' } })

  generalWs.mergeCells(`B${headerStartRow}:B${headerEndRow}`)
  const t2hB = generalWs.getCell(`B${headerStartRow}`)
  t2hB.value = 'TOTAL NO DISPONIBILIDAD\n(Tiempo)'
  styleCell(t2hB, { font: { name: 'Arial', size: 9, bold: true }, fill: FILL_LIGHT_GREEN, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } })

  generalWs.mergeCells(`C${headerStartRow}:C${headerEndRow}`)
  const t2hC = generalWs.getCell(`C${headerStartRow}`)
  t2hC.value = 'DISPONIBILIDAD\n(%)'
  styleCell(t2hC, { font: { name: 'Arial', size: 9, bold: true }, fill: FILL_LIGHT_GREEN, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } })

  generalWs.mergeCells(`D${headerStartRow}:I${headerStartRow}`)
  const t2hNoDisp = generalWs.getCell(`D${headerStartRow}`)
  t2hNoDisp.value = 'NO DISPONIBILIDAD'
  styleCell(t2hNoDisp, { font: { name: 'Arial', size: 10, bold: true }, fill: FILL_LIGHT_GREEN, alignment: { horizontal: 'center', vertical: 'middle' } })

  for (let c = 1; c <= 9; c++) {
    generalWs.getRow(headerStartRow).getCell(c).border = BORDER_THIN
  }

  // Row 2: Sub-headers for indicators
  const subheaders2 = [
    { col: 4, label: 'IIBHIBM\nPROVEEDOR\n(tiempo)' },
    { col: 5, label: 'IIBHIBM\nPROVEEDOR\n(%)' },
    { col: 6, label: 'IIBHIBM\nPROGRAMADA\n(tiempo)' },
    { col: 7, label: 'IIBHIBM\nPROGRAMADA\n(%)' },
    { col: 8, label: 'IIBHIBM\nFALLAS\n(tiempo)' },
    { col: 9, label: 'IIBHIBM\nFALLAS\n(%)' }
  ]

  const subheaderRowObj = generalWs.getRow(headerEndRow)
  subheaderRowObj.height = 36
  subheaders2.forEach(sh => {
    const cell = subheaderRowObj.getCell(sh.col)
    cell.value = sh.label
    styleCell(cell, {
      font: { name: 'Arial', size: 8, bold: true },
      fill: FILL_LIGHT_GREEN,
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
    })
  })
  for (let c = 1; c <= 9; c++) {
    generalWs.getRow(headerEndRow).getCell(c).border = BORDER_THIN
  }
  r = headerEndRow + 1

  // Table 2 Data rows
  for (const sys of report.systems) {
    const row = generalWs.getRow(r)
    row.height = 20

    const c1 = row.getCell(1)
    c1.value = sys.sistema
    styleCell(c1, { font: { name: 'Arial', size: 9, bold: true }, alignment: { horizontal: 'left', vertical: 'middle' } })

    const c2 = row.getCell(2)
    c2.value = sys.indicators.proveedor.seconds + sys.indicators.programada.seconds + sys.indicators.fallas.seconds > 0
      ? `${Math.floor(sys.totalDowntimeMinutes / 60).toString().padStart(2, '0')}:${Math.floor(sys.totalDowntimeMinutes % 60).toString().padStart(2, '0')}`
      : '00:00'
    styleCell(c2, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c3 = row.getCell(3)
    c3.value = formatPercentSpanish(sys.uptimePercent)
    styleCell(c3, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c4 = row.getCell(4)
    c4.value = sys.indicators.proveedor.formattedTime
    styleCell(c4, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c5 = row.getCell(5)
    c5.value = formatPercentSpanish(sys.indicators.proveedor.percent)
    styleCell(c5, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c6 = row.getCell(6)
    c6.value = sys.indicators.programada.formattedTime
    styleCell(c6, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c7 = row.getCell(7)
    c7.value = formatPercentSpanish(sys.indicators.programada.percent)
    styleCell(c7, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c8 = row.getCell(8)
    c8.value = sys.indicators.fallas.formattedTime
    styleCell(c8, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    const c9 = row.getCell(9)
    c9.value = formatPercentSpanish(sys.indicators.fallas.percent)
    styleCell(c9, { font: { name: 'Arial', size: 9 }, alignment: { horizontal: 'center', vertical: 'middle' } })

    r++
  }

  // Generate buffer and return as Blob
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}

/**
 * Generates an empty downloadable template file for the user.
 */
export async function generateEmptyTemplateWorkbook(): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema de Uptime BMSC'
  const ws = workbook.addWorksheet('Eventos Mensuales', {
    views: [{ showGridLines: true }]
  })

  ws.columns = [
    { width: 22 }, // SISTEMA
    { width: 28 }, // FECHA
    { width: 22 }, // HORA DE INICIO CAIDA
    { width: 22 }, // HORA DE FIN CAIDA
    { width: 24 }, // TIEMPO SERVICIO ABAJO
    { width: 20 }, // INDICADOR
    { width: 55 }  // MOTIVO
  ]

  const headerRow = ws.getRow(1)
  headerRow.height = 24
  const headers = [
    'SISTEMA',
    'FECHA',
    'HORA DE INICIO CAIDA',
    'HORA DE FIN CAIDA',
    'TIEMPO SERVICIO ABAJO',
    'INDICADOR',
    'MOTIVO'
  ]

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1)
    cell.value = h
    styleCell(cell, {
      font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: FILL_DARK_GRAY,
      alignment: { horizontal: 'center', vertical: 'middle' }
    })
  })

  // Sample placeholder row
  const sampleRow = ws.getRow(2)
  sampleRow.height = 20
  const sampleValues = [
    'CORE T24',
    'jueves, 18 de junio de 2026',
    '10:25:00 a. m.',
    '11:06:00 a. m.',
    '00:41:00',
    'II-FALLAS',
    'Problemas en inicios de sesión de usuarios, por bloqueo en tabla de registro de sesiones.'
  ]
  sampleValues.forEach((val, idx) => {
    const cell = sampleRow.getCell(idx + 1)
    cell.value = val
    styleCell(cell, {
      font: { name: 'Arial', size: 10 },
      alignment: { horizontal: idx === 0 || idx === 1 || idx === 6 ? 'left' : 'center', vertical: 'middle' }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
