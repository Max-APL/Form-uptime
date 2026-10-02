import ExcelJS from 'exceljs'
import type { AchStatisticRecord } from '../types/achStatistics'
import {
  parseAchAmount,
  DEFAULT_ACH_TIPOS
} from '../types/achStatistics'

export interface ParsedAchExcelResult {
  records: AchStatisticRecord[]
  rowCount: number
  sheetName: string
  warnings: string[]
}

function cleanCell(val: any): string {
  if (val === null || val === undefined) return ''
  if (val instanceof Date) {
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'object') {
    if ('text' in val && typeof val.text === 'string') return val.text.trim()
    if ('result' in val && val.result !== undefined) return String(val.result).trim()
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((t: any) => t.text || '').join('').trim()
    }
  }
  return String(val).trim()
}

export function stripExamplePrefix(val: string): string {
  if (!val) return ''
  return val
    .replace(/^\s*[\(\[\{]?\s*ejemplo\s*[\)\]\}]?\s*:?\s*/i, '')
    .replace(/\s*[\(\[\{]?\s*ejemplo\s*[\)\]\}]?\s*$/i, '')
    .trim()
}

function findColIdx(headers: string[], candidates: string[]): number {
  return headers.findIndex(h => {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    return candidates.some(c => clean.includes(c.replace(/[^a-z0-9]/g, '')))
  })
}

function findHeaderRowIndex(rawRows: string[][]): number {
  let bestIdx = -1
  let bestScore = 0

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i]
    const nonEmpties = row.map(c => c.trim()).filter(Boolean)
    const uniqueVals = new Set(nonEmpties.map(c => c.toLowerCase()))
    if (uniqueVals.size < 2) continue

    let score = 0
    const cleanCells = row.map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))

    const hasFecha = cleanCells.some(c => c.includes('fecha') || c.includes('date') || c.includes('dia'))
    const hasTipo = cleanCells.some(c => c.includes('tipo') || c.includes('transaccion') || c.includes('concepto') || c.includes('operacion'))
    const hasCantidad = cleanCells.some(c => c.includes('cant') || c.includes('cantidad') || c.includes('numero') || c.includes('totaltrx'))
    const hasMonto = cleanCells.some(c => c.includes('monto') || c.includes('importe') || c.includes('bs') || c.includes('bolivianos'))
    const hasMld = cleanCells.some(c => c.includes('mld') || c.includes('bcb') || c.includes('central'))
    const hasRevision = cleanCells.some(c => c.includes('revision') || c.includes('revisado') || c.includes('estado') || c.includes('validad'))

    if (hasFecha) score++
    if (hasTipo) score++
    if (hasCantidad) score++
    if (hasMonto) score++
    if (hasMld) score++
    if (hasRevision) score++

    if (score > bestScore && score >= 2) {
      bestScore = score
      bestIdx = i
    }
  }

  return bestIdx
}

export async function parseAchExcelBuffer(
  buffer: ArrayBuffer,
  defaultDate?: string
): Promise<ParsedAchExcelResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const sheet = workbook.worksheets[0]
  if (!sheet) {
    throw new Error('El archivo Excel no contiene ninguna hoja válida.')
  }

  const rawRows: string[][] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const rowValues: string[] = []
    const maxCol = Math.max(row.cellCount, 12)
    for (let c = 1; c <= maxCol; c++) {
      rowValues.push(cleanCell(row.getCell(c).value))
    }
    rawRows.push(rowValues)
  })

  if (rawRows.length === 0) {
    return {
      records: [],
      rowCount: 0,
      sheetName: sheet.name,
      warnings: ['La hoja de Excel está completamente vacía.']
    }
  }

  const headerIdx = findHeaderRowIndex(rawRows)
  let headers: string[] = []
  let dataRows: string[][] = []

  if (headerIdx !== -1) {
    headers = rawRows[headerIdx].map(h => h.trim())
    dataRows = rawRows.slice(headerIdx + 1)
  } else {
    dataRows = rawRows
  }

  let colFecha = findColIdx(headers, ['fecha', 'dia', 'date', 'periodo'])
  
  // Specific MLD vs ACH column search
  let colTipoAch = -1
  let colTipoMld = -1
  let colCantAch = -1
  let colCantMld = -1
  let colMontoAch = -1
  let colMontoMld = -1
  let colRevision = findColIdx(headers, ['revision', 'revisado', 'valida', 'check', 'estado'])

  headers.forEach((h, idx) => {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isMld = clean.includes('mld') || clean.includes('bcb') || clean.includes('central')
    if (clean.includes('tipo') || clean.includes('transaccion') || clean.includes('concepto')) {
      if (isMld) {
        if (colTipoMld === -1) colTipoMld = idx
      } else {
        if (colTipoAch === -1) colTipoAch = idx
      }
    } else if (clean.includes('cant') || clean.includes('num') || clean.includes('trx')) {
      if (isMld) {
        if (colCantMld === -1) colCantMld = idx
      } else {
        if (colCantAch === -1) colCantAch = idx
      }
    } else if (clean.includes('monto') || clean.includes('importe') || clean.includes('bs') || clean.includes('total')) {
      if (isMld) {
        if (colMontoMld === -1) colMontoMld = idx
      } else {
        if (colMontoAch === -1) colMontoAch = idx
      }
    }
  })

  // Positional fallback if headers not found or incomplete
  if (colFecha === -1) colFecha = 0
  if (colTipoAch === -1) colTipoAch = 1
  if (colCantAch === -1) colCantAch = 2
  if (colMontoAch === -1) colMontoAch = 3
  if (colTipoMld === -1) colTipoMld = 4
  if (colCantMld === -1) colCantMld = 5
  if (colMontoMld === -1) colMontoMld = 6
  if (colRevision === -1) colRevision = 7

  const records: AchStatisticRecord[] = []
  const warnings: string[] = []
  const todayIso = defaultDate || new Date().toISOString().slice(0, 10)

  dataRows.forEach((row, rowIdx) => {
    if (!row || row.every(c => !c.trim())) return

    let rawFecha = row[colFecha] ? cleanCell(row[colFecha]) : ''
    let rawTipoAch = row[colTipoAch] ? cleanCell(row[colTipoAch]) : ''
    let rawCantAch = row[colCantAch] ? cleanCell(row[colCantAch]) : ''
    let rawMontoAch = row[colMontoAch] ? cleanCell(row[colMontoAch]) : ''
    let rawTipoMld = row[colTipoMld] ? cleanCell(row[colTipoMld]) : ''
    let rawCantMld = row[colCantMld] ? cleanCell(row[colCantMld]) : ''
    let rawMontoMld = row[colMontoMld] ? cleanCell(row[colMontoMld]) : ''
    let rawRevision = row[colRevision] ? cleanCell(row[colRevision]) : ''

    // Detect example row
    if (
      rawTipoAch.toLowerCase().includes('(ejemplo)') ||
      rawTipoMld.toLowerCase().includes('(ejemplo)') ||
      rawTipoAch.toLowerCase().includes('ejemplo')
    ) {
      return
    }

    // Clean example prefixes if present
    rawTipoAch = stripExamplePrefix(rawTipoAch)
    rawTipoMld = stripExamplePrefix(rawTipoMld)

    if (!rawTipoAch && !rawTipoMld && !rawMontoAch && !rawMontoMld) {
      return
    }

    // Format Fecha
    let fecha = todayIso
    if (rawFecha) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawFecha)) {
        fecha = rawFecha
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawFecha)) {
        const parts = rawFecha.split('/')
        fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(rawFecha)) {
        const parts = rawFecha.split('-')
        fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }

    // Amounts and counts
    const cantidad = Math.max(0, Math.round(parseAchAmount(rawCantAch)))
    const monto = parseAchAmount(rawMontoAch)
    const cantidadMld = Math.max(0, Math.round(parseAchAmount(rawCantMld)))
    const montoMld = parseAchAmount(rawMontoMld)

    // Revision (1 or 0)
    let revision = 0
    const cleanRev = rawRevision.toLowerCase().trim()
    if (cleanRev === '1' || cleanRev === 'si' || cleanRev === 'true' || cleanRev === 'revisado' || cleanRev === 'ok') {
      revision = 1
    }

    records.push({
      id: `ach-xl-${Date.now()}-${rowIdx}-${Math.random().toString(36).substring(2, 6)}`,
      fecha,
      tipo: rawTipoAch || DEFAULT_ACH_TIPOS[0],
      cantidad,
      monto,
      tipoMld: rawTipoMld || '',
      cantidadMld,
      montoMld,
      revision,
      selected: false,
      creadoEn: new Date().toISOString()
    })
  })

  return {
    records,
    rowCount: records.length,
    sheetName: sheet.name,
    warnings
  }
}
