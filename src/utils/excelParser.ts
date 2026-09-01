import ExcelJS from 'exceljs'
import type { RawEventRecord } from '../types/uptime'
import {
  parseDurationToSeconds,
  calculateDurationFromTimes,
  normalizeIndicator
} from './calculator'

export interface ParsedExcelResult {
  events: RawEventRecord[]
  detectedMonth?: number
  detectedYear?: number
  detectedPeriods: Array<{ month: number; year?: number; count: number }>
  sheetName: string
  rowCount: number
  warnings: string[]
}

const MONTH_NAMES_MAP: Record<string, number> = {
  enero: 1, jan: 1, january: 1,
  febrero: 2, feb: 2, february: 2,
  marzo: 3, mar: 3, march: 3,
  abril: 4, apr: 4, april: 4,
  mayo: 5, may: 5,
  junio: 6, jun: 6, june: 6,
  julio: 7, jul: 7, july: 7,
  agosto: 8, aug: 8, august: 8,
  septiembre: 9, setiembre: 9, sep: 9, september: 9,
  octubre: 10, oct: 10, october: 10,
  noviembre: 11, nov: 11, november: 11,
  diciembre: 12, dic: 12, dec: 12, december: 12
}

/**
 * Attempts to extract month and year from a date string or Date object.
 */
function extractMonthAndYearFromDate(rawVal: any): { month?: number; year?: number } {
  if (!rawVal) return {}

  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return { month: rawVal.getMonth() + 1, year: rawVal.getFullYear() }
  }

  const str = String(rawVal).toLowerCase().trim()

  // Match Spanish text like "jueves, 18 de junio de 2026"
  for (const [mName, mNum] of Object.entries(MONTH_NAMES_MAP)) {
    if (str.includes(mName)) {
      const yearMatch = str.match(/\b(20\d\d)\b/)
      const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined
      return { month: mNum, year }
    }
  }

  // Match standard numerical dates DD/MM/YYYY or YYYY-MM-DD
  const dmyMatch = str.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/)
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10)
    const p2 = parseInt(dmyMatch[2], 10)
    const y = parseInt(dmyMatch[3], 10)
    // Assume DD/MM/YYYY if p2 <= 12
    const m = p2 <= 12 ? p2 : p1
    return { month: m, year: y }
  }

  const ymdMatch = str.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/)
  if (ymdMatch) {
    return { month: parseInt(ymdMatch[2], 10), year: parseInt(ymdMatch[1], 10) }
  }

  return {}
}

/**
 * Normalizes header string to find matching column.
 */
function findColumnIndex(headers: string[], candidates: string[]): number {
  return headers.findIndex(h => {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    return candidates.some(c => clean.includes(c.replace(/[^a-z0-9]/g, '')))
  })
}

function getCellFormattedValue(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return ''
  if (cell.value instanceof Date) {
    const d = cell.value
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }
  if (typeof cell.value === 'object') {
    if ('text' in cell.value && typeof (cell.value as any).text === 'string') {
      return (cell.value as any).text
    }
    if ('result' in cell.value && (cell.value as any).result !== undefined) {
      return String((cell.value as any).result ?? '')
    }
    if ('richText' in cell.value && Array.isArray((cell.value as any).richText)) {
      return (cell.value as any).richText.map((t: any) => t.text || '').join('')
    }
    if ('hyperlink' in cell.value && (cell.value as any).text) {
      return String((cell.value as any).text)
    }
  }
  return String(cell.value).trim()
}

/**
 * Parses an Excel file buffer and returns standardized incident event records.
 */
export async function parseExcelBuffer(buffer: ArrayBuffer | Uint8Array): Promise<ParsedExcelResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as any)

  if (workbook.worksheets.length === 0) {
    throw new Error('El archivo Excel no contiene hojas de datos.')
  }

  // Use the first sheet as requested
  const worksheet = workbook.worksheets[0]
  const sheetName = worksheet.name || 'Hoja1'

  const rows: ExcelJS.Row[] = []
  worksheet.eachRow((row) => {
    rows.push(row)
  })

  if (rows.length === 0) {
    return {
      events: [],
      detectedPeriods: [],
      sheetName,
      rowCount: 0,
      warnings: ['La hoja de cálculo está vacía.']
    }
  }

  // Header row
  const headerRow = rows[0]
  const headers: string[] = []
  const maxCol = Math.max(headerRow.cellCount, headerRow.actualCellCount, 20)
  for (let col = 1; col <= maxCol; col++) {
    headers.push(getCellFormattedValue(headerRow.getCell(col)))
  }

  // Column matching with synonyms
  const idxSistema = findColumnIndex(headers, ['sistema', 'system', 'servicio', 'aplicacion', 'core'])
  const idxFecha = findColumnIndex(headers, ['fecha', 'date', 'dia'])
  const idxInicio = findColumnIndex(headers, ['horadeiniciocaida', 'iniciocaida', 'horainicio', 'inicio', 'starttime'])
  const idxFin = findColumnIndex(headers, ['horadefincaida', 'fincaida', 'horafin', 'fin', 'endtime'])
  const idxTiempo = findColumnIndex(headers, ['tiemposervicioabajo', 'tiempocaida', 'duracion', 'tiempoabajo', 'downtime'])
  const idxIndicador = findColumnIndex(headers, ['indicador', 'indicator', 'tipo', 'tipodefalla', 'categoria'])
  const idxMotivo = findColumnIndex(headers, ['motivo', 'descripcion', 'causa', 'observacion', 'detalle', 'reason'])

  const events: RawEventRecord[] = []
  const monthCounts: Record<number, number> = {}
  const yearCounts: Record<number, number> = {}
  const periodCounts: Record<string, { month: number; year?: number; count: number }> = {}
  const warnings: string[] = []

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const rowIdx = r + 1

    const getVal = (idx: number) => {
      if (idx < 0) return ''
      return getCellFormattedValue(row.getCell(idx + 1))
    }

    const sistemaVal = getVal(idxSistema)
    const fechaVal = getVal(idxFecha)
    const inicioVal = getVal(idxInicio)
    const finVal = getVal(idxFin)
    const tiempoVal = getVal(idxTiempo)
    const indicadorVal = getVal(idxIndicador)
    const motivoVal = getVal(idxMotivo)

    // Skip totally empty rows
    if (!sistemaVal && !fechaVal && !tiempoVal && !motivoVal) {
      continue
    }

    if (!sistemaVal) {
      warnings.push(`Fila ${rowIdx}: Registro omitido por no tener nombre de SISTEMA.`)
      continue
    }

    // Detect month and year from fecha
    const { month, year } = extractMonthAndYearFromDate(fechaVal)
    if (month) {
      monthCounts[month] = (monthCounts[month] || 0) + 1
    }
    if (year) {
      yearCounts[year] = (yearCounts[year] || 0) + 1
    }
    if (month) {
      const periodKey = `${year || 'sin-anio'}-${month}`
      const period = periodCounts[periodKey] || { month, year, count: 0 }
      period.count++
      periodCounts[periodKey] = period
    }

    // Calculate duration in seconds
    let sec = parseDurationToSeconds(tiempoVal)
    if (sec <= 0 && inicioVal && finVal) {
      sec = calculateDurationFromTimes(inicioVal, finVal)
    }

    events.push({
      id: `evt-${rowIdx}-${Date.now()}`,
      sistema: sistemaVal,
      fecha: fechaVal,
      horaInicio: inicioVal,
      horaFin: finVal,
      tiempoServicioAbajo: tiempoVal || (sec > 0 ? `${Math.floor(sec/3600).toString().padStart(2, '0')}:${Math.floor((sec%3600)/60).toString().padStart(2, '0')}:${(sec%60).toString().padStart(2, '0')}` : '00:00:00'),
      indicador: normalizeIndicator(indicadorVal),
      motivo: motivoVal,
      durationSeconds: sec,
      durationMinutes: sec / 60
    })
  }

  // Determine most frequent detected month and year
  let detectedMonth: number | undefined
  let detectedYear: number | undefined
  let maxMonthFreq = 0
  for (const [m, count] of Object.entries(monthCounts)) {
    if (count > maxMonthFreq) {
      maxMonthFreq = count
      detectedMonth = parseInt(m, 10)
    }
  }

  let maxYearFreq = 0
  for (const [y, count] of Object.entries(yearCounts)) {
    if (count > maxYearFreq) {
      maxYearFreq = count
      detectedYear = parseInt(y, 10)
    }
  }

  return {
    events,
    detectedMonth,
    detectedYear,
    detectedPeriods: Object.values(periodCounts).sort((a, b) => b.count - a.count),
    sheetName,
    rowCount: events.length,
    warnings
  }
}
