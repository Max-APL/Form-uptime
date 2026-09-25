import ExcelJS from 'exceljs'
import type { NetworkEventRecord } from '../types/networkUptime'
import { parseUptimePercentage } from '../types/networkUptime'

export interface ParsedNetworkExcelResult {
  records: NetworkEventRecord[]
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

/**
 * Elimina prefijos o sufijos como "(EJEMPLO)", "[EJEMPLO]", "EJEMPLO:" de un valor.
 */
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

/**
 * Escanea las primeras 10 filas de la hoja para encontrar la fila real de cabecera,
 * evitando banners de títulos fusionados o filas de instrucciones.
 */
function findHeaderRowIndex(rawRows: string[][]): number {
  let bestIdx = -1
  let bestScore = 0

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i]
    const nonEmpties = row.map(c => c.trim()).filter(Boolean)
    const uniqueVals = new Set(nonEmpties.map(c => c.toLowerCase()))

    // Omitir filas vacías o filas combinadas que repiten el mismo texto en todas las columnas
    if (uniqueVals.size < 2) continue

    let score = 0
    const cleanCells = row.map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))

    const hasEnlace = cleanCells.some(c =>
      c.includes('enlace') || c.includes('tipoenlace') || c.includes('tipodeenlace') || c.includes('servicio')
    )
    const hasDepto = cleanCells.some(c =>
      c.includes('departamento') || c.includes('ciudad') || c.includes('depto') ||
      c.includes('region') || c.includes('localidad') || c.includes('municipio') ||
      c.includes('ubicacion') || c.includes('ciudaddepartamento')
    )
    const hasNombre = cleanCells.some(c =>
      c.includes('nombre') || c.includes('proveedor') || c.includes('agencia') ||
      c.includes('atm') || c.includes('cajero') || c.includes('detalle') || c.includes('sitio')
    )
    const hasMensual = cleanCells.some(c =>
      c.includes('mensual') || c.includes('uptimemes') || c.includes('uptimemensual') ||
      (c.includes('uptime') && !c.includes('anual')) || c === 'mes'
    )
    const hasAnual = cleanCells.some(c =>
      c.includes('anual') || c.includes('anualtotal') || c.includes('year') || c.includes('meta')
    )
    const hasFecha = cleanCells.some(c =>
      c.includes('fecha') || c.includes('date') || c.includes('periodo') || c.includes('referencia')
    )

    if (hasEnlace) score++
    if (hasDepto) score++
    if (hasNombre) score++
    if (hasMensual) score++
    if (hasAnual) score++
    if (hasFecha) score++

    if (score > bestScore && score >= 2) {
      bestScore = score
      bestIdx = i
    }
  }

  return bestIdx
}

export async function parseNetworkExcelBuffer(
  buffer: ArrayBuffer | Uint8Array,
  defaultEnlace: string = 'ENLACES WAN NACIONAL',
  defaultDepto: string = '',
  referenceDate?: string
): Promise<ParsedNetworkExcelResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as any)

  if (workbook.worksheets.length === 0) {
    throw new Error('El archivo Excel no contiene hojas de datos.')
  }

  const worksheet = workbook.worksheets[0]
  const sheetName = worksheet.name || 'Hoja1'

  const rawRows: string[][] = []
  worksheet.eachRow((row) => {
    const rowVals: string[] = []
    const cellCount = Math.max(row.cellCount, row.actualCellCount, 15)
    for (let c = 1; c <= cellCount; c++) {
      rowVals.push(cleanCell(row.getCell(c).value))
    }
    rawRows.push(rowVals)
  })

  if (rawRows.length === 0) {
    return { records: [], rowCount: 0, sheetName, warnings: ['La hoja de cálculo está vacía.'] }
  }

  const headerRowIdx = findHeaderRowIndex(rawRows)
  const todayStr = referenceDate || new Date().toISOString().slice(0, 10)
  const records: NetworkEventRecord[] = []
  const warnings: string[] = []

  if (headerRowIdx >= 0) {
    const headers = rawRows[headerRowIdx]
    const colFecha = findColIdx(headers, ['fechareferencia', 'fecha', 'date', 'dia', 'periodo', 'referencia'])
    const colEnlace = findColIdx(headers, ['tipodeenlace', 'tipoenlace', 'enlace', 'tiposervicio', 'servicio'])
    const colDepto = findColIdx(headers, [
      'ciudaddepartamento',
      'departamentociudad',
      'departamento',
      'ciudad',
      'depto',
      'region',
      'localidad',
      'municipio',
      'ubicacion'
    ])
    const colNombre = findColIdx(headers, [
      'proveedoragencianombre',
      'proveedor',
      'agencia',
      'nombre',
      'atm',
      'cajero',
      'detalle',
      'descripcion',
      'sitio'
    ])
    const colMensual = findColIdx(headers, ['uptimemensual', 'mensual', 'uptimemes', 'mes', 'uptime'])
    const colAnual = findColIdx(headers, ['uptimeanual', 'anualtotal', 'anual', 'year', 'meta'])

    for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
      const row = rawRows[r]
      if (row.every(c => !c)) continue

      const rawNombre = colNombre >= 0 && row[colNombre] ? row[colNombre].trim() : ''
      const rawDepto = colDepto >= 0 && row[colDepto] ? row[colDepto].trim() : ''
      const rawEnlace = colEnlace >= 0 && row[colEnlace] ? row[colEnlace].trim() : ''

      // Omitir si la fila es una repetición accidental de las cabeceras
      const isHeaderRepeat = (
        rawNombre.toLowerCase().includes('proveedor') && rawNombre.toLowerCase().includes('agencia')
      ) || (
        rawEnlace.toLowerCase().includes('tipo de enlace')
      ) || (
        rawDepto.toLowerCase().includes('ciudad') && rawDepto.toLowerCase().includes('departamento')
      )
      if (isHeaderRepeat) continue

      // Extraer y limpiar departamento/ciudad (removiendo '(EJEMPLO)' si viene de la plantilla)
      let deptoVal = defaultDepto
      if (rawDepto) {
        const cleanedDepto = stripExamplePrefix(rawDepto).toUpperCase()
        deptoVal = cleanedDepto || rawDepto.toUpperCase()
      }

      // Extraer y normalizar enlace
      let enlaceVal = defaultEnlace
      if (rawEnlace) {
        const norm = stripExamplePrefix(rawEnlace).toUpperCase()
        if (norm.includes('WAN')) {
          enlaceVal = 'ENLACES WAN NACIONAL'
        } else if (norm.includes('AGENCIA')) {
          enlaceVal = 'ENLACES AGENCIAS NACIONAL'
        } else if (norm.includes('ATM')) {
          enlaceVal = 'ENLACES ATMS NACIONAL'
        } else {
          enlaceVal = norm || defaultEnlace
        }
      }

      const fechaVal = colFecha >= 0 && row[colFecha] ? row[colFecha] : todayStr
      const mensualVal = colMensual >= 0 && row[colMensual] ? parseUptimePercentage(row[colMensual]) : 100
      const anualVal = colAnual >= 0 && row[colAnual] ? parseUptimePercentage(row[colAnual]) : mensualVal

      if (!rawNombre && !deptoVal) continue

      records.push({
        id: `net_imp_${Date.now()}_${r}_${Math.random().toString(36).substr(2, 5)}`,
        creadoEn: new Date().toISOString(),
        fecha: fechaVal,
        enlace: enlaceVal,
        departamento: deptoVal,
        nombre: rawNombre,
        uptimeMensual: mensualVal,
        uptimeAnual: anualVal
      })
    }
  } else {
    // Positional fallback cuando no hay cabeceras reconocibles
    for (let r = 0; r < rawRows.length; r++) {
      const row = rawRows[r]
      if (row.every(c => !c)) continue

      let startOffset = 0
      if (!isNaN(Number(row[0])) && row.length >= 4) {
        startOffset = 1
      }

      const effective = row.slice(startOffset).filter(Boolean)
      if (effective.length < 2) continue

      let depto = defaultDepto
      let nombre = ''
      let mensual = 100
      let anual = 100

      if (effective.length >= 4) {
        depto = stripExamplePrefix(effective[0]).toUpperCase()
        nombre = effective[1]
        mensual = parseUptimePercentage(effective[2])
        anual = parseUptimePercentage(effective[3])
      } else if (effective.length === 3) {
        depto = stripExamplePrefix(effective[0]).toUpperCase()
        nombre = effective[1]
        mensual = parseUptimePercentage(effective[2])
        anual = mensual
      } else if (effective.length === 2) {
        nombre = effective[0]
        mensual = parseUptimePercentage(effective[1])
        anual = mensual
      }

      if (!nombre && !depto) continue

      records.push({
        id: `net_pos_${Date.now()}_${r}_${Math.random().toString(36).substr(2, 5)}`,
        creadoEn: new Date().toISOString(),
        fecha: todayStr,
        enlace: defaultEnlace,
        departamento: depto,
        nombre,
        uptimeMensual: mensual,
        uptimeAnual: anual
      })
    }
  }

  return {
    records,
    rowCount: records.length,
    sheetName,
    warnings
  }
}
