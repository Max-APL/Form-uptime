import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Genera el Workbook de Excel para la plantilla oficial de Incidentes de Sistemas (Downtime).
 * Contiene exactamente 1 fila de cabecera y 1 fila de ejemplo descriptiva.
 */
export async function generateIncidentTemplateWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMSC Uptime System'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Plantilla_Incidentes', {
    views: [{ showGridLines: true }]
  })

  // 1. Encabezados de Columna en Fila 1
  const headers = [
    'SISTEMA (*)',
    'FECHA (*)',
    'HORA INICIO CAIDA (*)',
    'HORA FIN CAIDA (*)',
    'TIEMPO SERVICIO ABAJO',
    'INDICADOR (*)',
    'MOTIVO (*)'
  ]

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.height = 28

  const notes = [
    'Nombre del sistema o servicio afectado (ej: BANCA MOVIL, SWIFT, ATM, ASFI...)',
    'Fecha del evento (ej: DD/MM/AAAA o formato fecha Excel)',
    'Hora de inicio de la caída (HH:MM:SS, ej: 14:30:00)',
    'Hora de fin o restitución (HH:MM:SS, ej: 15:15:00)',
    'Duración total caída (HH:MM:SS, ej: 00:45:00). Opcional si indica inicio y fin.',
    'Indicador oficial: II-FALLAS, II-PROGRAMADA o II-PROVEEDOR',
    'Descripción o motivo técnico del incidente'
  ]

  headerRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004D2C' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF003B22' } },
      bottom: { style: 'medium', color: { argb: 'FFD39F28' } },
      left: { style: 'thin', color: { argb: 'FF003B22' } },
      right: { style: 'thin', color: { argb: 'FF003B22' } }
    }
    if (notes[colNum - 1]) {
      cell.note = notes[colNum - 1]
    }
  })

  // 2. Exactamente UNA única fila de ejemplo que indica explícitamente en sus campos que es un ejemplo
  const sampleRowValues = [
    '(EJEMPLO) BANCA MOVIL',
    '25/08/2026',
    '14:30:00',
    '15:15:00',
    '00:45:00',
    'II-FALLAS',
    '(EJEMPLO) Intermitencia temporal en servidor de autenticación'
  ]

  const sampleRow = sheet.getRow(2)
  sampleRow.values = sampleRowValues
  sampleRow.height = 22

  sampleRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9, italic: colNum === 1 || colNum === 7 }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    }
    if (colNum === 1 || colNum === 7) {
      cell.alignment = { horizontal: 'left', vertical: 'middle' }
    } else {
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' }
    }
  })

  // Anchos de columna
  sheet.columns = [
    { key: 'sistema', width: 26 },
    { key: 'fecha', width: 16 },
    { key: 'inicio', width: 22 },
    { key: 'fin', width: 22 },
    { key: 'tiempo', width: 24 },
    { key: 'indicador', width: 18 },
    { key: 'motivo', width: 50 }
  ]

  return workbook
}

/**
 * Genera el Workbook de Excel para la plantilla oficial de Disponibilidad de Redes.
 * Contiene exactamente 1 fila de cabecera y 1 fila de ejemplo descriptiva.
 */
export async function generateNetworkTemplateWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMSC Uptime System'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Plantilla_Redes', {
    views: [{ showGridLines: true }]
  })

  // 1. Encabezados de Columna en Fila 1
  const headers = [
    'TIPO DE ENLACE (*)',
    'CIUDAD / DEPARTAMENTO (*)',
    'PROVEEDOR / AGENCIA / NOMBRE (*)',
    'UPTIME MENSUAL (%) (*)',
    'UPTIME ANUAL (%) (*)',
    'FECHA REFERENCIA'
  ]

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.height = 28

  const notes = [
    'Valores válidos: ENLACES WAN NACIONAL, ENLACES AGENCIAS NACIONAL o ENLACES ATMS NACIONAL',
    'Ciudad o Departamento: LA PAZ, SANTA CRUZ, COCHABAMBA, RIBERALTA, EL ALTO, etc.',
    'Nombre del proveedor WAN (ej: ENTEL), agencia (ej: CENTRAL) o cajero ATM (ej: EQUIPETROL)',
    'Uptime mensual en porcentaje (ej: 99.9850% o 100%)',
    'Uptime anual acumulado en porcentaje (ej: 99.9990%)',
    'Fecha de referencia del corte en formato AAAA-MM-DD o DD/MM/AAAA (ej: 2026-08-31)'
  ]

  headerRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004D2C' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF003B22' } },
      bottom: { style: 'medium', color: { argb: 'FFD39F28' } },
      left: { style: 'thin', color: { argb: 'FF003B22' } },
      right: { style: 'thin', color: { argb: 'FF003B22' } }
    }
    if (notes[colNum - 1]) {
      cell.note = notes[colNum - 1]
    }
  })

  // 2. Exactamente UNA única fila de ejemplo que indica explícitamente en sus campos que es un ejemplo
  const sampleRowValues = [
    '(EJEMPLO) ENLACES WAN NACIONAL',
    '(EJEMPLO) LA PAZ',
    '(EJEMPLO) ENTEL (Enlace Principal WAN)',
    '99.9850%',
    '99.9990%',
    '2026-08-31'
  ]

  const sampleRow = sheet.getRow(2)
  sampleRow.values = sampleRowValues
  sampleRow.height = 22

  sampleRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9, italic: colNum === 1 || colNum === 3 }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    }
    if (colNum === 3) {
      cell.alignment = { horizontal: 'left', vertical: 'middle' }
    } else {
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' }
    }
  })

  // Anchos de columna
  sheet.columns = [
    { key: 'enlace', width: 30 },
    { key: 'depto', width: 28 },
    { key: 'nombre', width: 40 },
    { key: 'mensual', width: 22 },
    { key: 'anual', width: 22 },
    { key: 'fecha', width: 18 }
  ]

  return workbook
}

/**
 * Genera el Workbook de Excel para la plantilla oficial de ACH Estadísticas (Resolución & MLD Banco Central).
 * Contiene encabezados oficiales y fila descriptiva de ejemplo.
 */
export async function generateAchTemplateWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMSC Uptime System'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Plantilla_ACH_Estadisticas', {
    views: [{ showGridLines: true }]
  })

  // 1. Encabezados de Columna en Fila 1 (Idénticos al formato oficial del banco)
  const headers = [
    'FECHA',
    'TIPO',
    'CANTIDAD',
    'MONTO',
    'TIPO MLD',
    'CANT MLD',
    'MONTO MLD',
    'REVISION'
  ]

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.height = 28

  const notes = [
    'Fecha del registro (ej: 9/1/2026 o 2026-09-01)',
    'Tipo de transacción: Abonos o Debitos',
    'Cantidad de transacciones ACH (ej: 391)',
    'Monto en Bolivianos ACH (ej: 692106.54)',
    'Tipo Banco Central MLD: Abonos o Debitos',
    'Cantidad MLD Banco Central (ej: 1)',
    'Monto MLD Banco Central en Bolivianos (ej: 100.00)',
    'Estado de revisión (1 = Sí, 0 = No)'
  ]

  headerRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    // ACH columns green, MLD columns navy blue, Revision gold
    if (colNum >= 5 && colNum <= 7) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Navy blue for BCB MLD
      }
    } else if (colNum === 8) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD39F28' } // Gold for revision
      }
      cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF000000' } }
    } else {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF004D2C' } // Corporate Green for ACH
      }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF003B22' } },
      bottom: { style: 'medium', color: { argb: 'FFD39F28' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    }
    if (notes[colNum - 1]) {
      cell.note = notes[colNum - 1]
    }
  })

  // 2. Fila de ejemplo con datos reales Abonos/Debitos
  const sampleRowValues = [
    '2026-09-02',
    '(EJEMPLO) Abonos',
    391,
    692106.54,
    '(EJEMPLO) Abonos',
    1,
    100.00,
    1
  ]

  const sampleRow = sheet.getRow(2)
  sampleRow.values = sampleRowValues
  sampleRow.height = 22

  sampleRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Arial', size: 9, italic: colNum === 2 || colNum === 5 }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    }
    if (colNum === 2 || colNum === 5) {
      cell.alignment = { horizontal: 'left', vertical: 'middle' }
    } else if (colNum === 3 || colNum === 6) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
      cell.numFmt = '#,##0'
    } else if (colNum === 4 || colNum === 7) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
      cell.numFmt = '#,##0.00'
    } else {
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' }
    }
  })

  // Anchos de columna
  sheet.columns = [
    { key: 'fecha', width: 16 },
    { key: 'tipo', width: 32 },
    { key: 'cantidad', width: 18 },
    { key: 'monto', width: 22 },
    { key: 'tipoMld', width: 32 },
    { key: 'cantidadMld', width: 18 },
    { key: 'montoMld', width: 22 },
    { key: 'revision', width: 18 }
  ]

  return workbook
}

/**
 * Descarga la plantilla oficial de Incidentes en el navegador.
 */
export async function downloadIncidentTemplate(): Promise<void> {
  const workbook = await generateIncidentTemplateWorkbook()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, 'BMSC_Plantilla_Importacion_Incidentes.xlsx')
}

/**
 * Descarga la plantilla oficial de Redes en el navegador.
 */
export async function downloadNetworkTemplate(): Promise<void> {
  const workbook = await generateNetworkTemplateWorkbook()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, 'BMSC_Plantilla_Importacion_Redes.xlsx')
}

/**
 * Descarga la plantilla oficial de ACH Estadísticas en el navegador.
 */
export async function downloadAchTemplate(): Promise<void> {
  const workbook = await generateAchTemplateWorkbook()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, 'BMSC_Plantilla_Importacion_ACH_Estadisticas.xlsx')
}

