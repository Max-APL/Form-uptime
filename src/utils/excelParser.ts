import * as XLSX from 'xlsx'
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
function findColumnKey(headers: string[], candidates: string[]): string | undefined {
  return headers.find(h => {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    return candidates.some(c => clean.includes(c.replace(/[^a-z0-9]/g, '')))
  })
}

/**
 * Parses an Excel or CSV file buffer and returns standardized incident event records.
 */
export async function parseExcelBuffer(buffer: ArrayBuffer | Uint8Array): Promise<ParsedExcelResult> {
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellText: true
  })

  const sheetNames = workbook.SheetNames
  if (sheetNames.length === 0) {
    throw new Error('El archivo Excel no contiene hojas de datos.')
  }

  // Use the first sheet as requested
  const firstSheetName = sheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  // Convert to array of objects with raw strings/values
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd'
  })

  if (rawRows.length === 0) {
    return {
      events: [],
      detectedPeriods: [],
      sheetName: firstSheetName,
      rowCount: 0,
      warnings: ['La hoja de cálculo está vacía.']
    }
  }

  // Get keys from first object
  const headerKeys = Object.keys(rawRows[0])

  // Column matching with synonyms
  const colSistema = findColumnKey(headerKeys, ['sistema', 'system', 'servicio', 'aplicacion', 'core']) || 'SISTEMA'
  const colFecha = findColumnKey(headerKeys, ['fecha', 'date', 'dia']) || 'FECHA'
  const colInicio = findColumnKey(headerKeys, ['horadeiniciocaida', 'iniciocaida', 'horainicio', 'inicio', 'starttime']) || 'HORA DE INICIO CAIDA'
  const colFin = findColumnKey(headerKeys, ['horadefincaida', 'fincaida', 'horafin', 'fin', 'endtime']) || 'HORA DE FIN CAIDA'
  const colTiempo = findColumnKey(headerKeys, ['tiemposervicioabajo', 'tiempocaida', 'duracion', 'tiempoabajo', 'downtime']) || 'TIEMPO SERVICIO ABAJO'
  const colIndicador = findColumnKey(headerKeys, ['indicador', 'indicator', 'tipo', 'tipodefalla', 'categoria']) || 'INDICADOR'
  const colMotivo = findColumnKey(headerKeys, ['motivo', 'descripcion', 'causa', 'observacion', 'detalle', 'reason']) || 'MOTIVO'

  const events: RawEventRecord[] = []
  const monthCounts: Record<number, number> = {}
  const yearCounts: Record<number, number> = {}
  const periodCounts: Record<string, { month: number; year?: number; count: number }> = {}
  const warnings: string[] = []

  let rowIdx = 0
  for (const row of rawRows) {
    rowIdx++
    const sistemaVal = String(row[colSistema] || '').trim()
    const fechaVal = String(row[colFecha] || '').trim()
    const inicioVal = String(row[colInicio] || '').trim()
    const finVal = String(row[colFin] || '').trim()
    const tiempoVal = String(row[colTiempo] || '').trim()
    const indicadorVal = String(row[colIndicador] || '').trim()
    const motivoVal = String(row[colMotivo] || '').trim()

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
    sheetName: firstSheetName,
    rowCount: events.length,
    warnings
  }
}
