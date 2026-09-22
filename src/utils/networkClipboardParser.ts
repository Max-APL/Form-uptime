import type { NetworkEventRecord } from '../types/networkUptime'
import { parseUptimePercentage } from '../types/networkUptime'

function cleanCell(val: string | undefined): string {
  if (!val) return ''
  return val.trim().replace(/^["']|["']$/g, '')
}

export function parsePastedNetworkText(
  text: string,
  defaultEnlace: string = 'ENLACES WAN NACIONAL',
  referenceDate?: string
): { records: NetworkEventRecord[]; warning?: string } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return { records: [], warning: 'El portapapeles no contiene texto válido.' }
  }

  const todayStr = referenceDate || new Date().toISOString().slice(0, 10)
  const firstLine = lines[0]
  const isTabDelimited = firstLine.includes('\t')
  const delimiter = isTabDelimited ? '\t' : firstLine.includes(';') ? ';' : ','

  const rows = lines.map(line => line.split(delimiter).map(cleanCell))
  if (rows.length === 0) {
    return { records: [] }
  }

  const headerCandidates = ['departamento', 'ciudad', 'nombre', 'agencia', 'proveedor', 'enlace', 'mensual', 'anual', 'uptime']
  const firstRowLower = rows[0].map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const hasHeader = firstRowLower.some(h => headerCandidates.some(c => h.includes(c)))

  const dataRows = hasHeader ? rows.slice(1) : rows
  const records: NetworkEventRecord[] = []

  let colIdx = {
    fecha: -1,
    enlace: -1,
    departamento: -1,
    nombre: -1,
    uptimeMensual: -1,
    uptimeAnual: -1
  }

  if (hasHeader) {
    const findIdx = (keywords: string[]) => {
      return firstRowLower.findIndex(h => keywords.some(k => h.includes(k)))
    }

    colIdx.fecha = findIdx(['fecha', 'date', 'dia'])
    colIdx.enlace = findIdx(['enlace', 'tipo', 'servicio'])
    colIdx.departamento = findIdx(['departamento', 'ciudad', 'depto', 'region'])
    colIdx.nombre = findIdx(['nombre', 'agencia', 'proveedor', 'atm', 'cajero'])
    colIdx.uptimeMensual = findIdx(['mensual', 'mes', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre', 'uptime'])
    colIdx.uptimeAnual = findIdx(['anual', 'meta', 'anualtotal', 'year'])
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (row.length === 0 || (row.length === 1 && !row[0])) continue

    // Heuristics if no headers detected:
    // If row has >= 4 columns: [Depto, Nombre, Mensual, Anual] or [Nro, Depto, Nombre, Mensual]
    let fecha = todayStr
    let enlace = defaultEnlace
    let departamento = 'NACIONAL'
    let nombre = ''
    let uptimeMensual = 100
    let uptimeAnual = 100

    if (hasHeader) {
      if (colIdx.fecha >= 0 && row[colIdx.fecha]) fecha = row[colIdx.fecha]
      if (colIdx.enlace >= 0 && row[colIdx.enlace]) enlace = row[colIdx.enlace]
      if (colIdx.departamento >= 0 && row[colIdx.departamento]) departamento = row[colIdx.departamento].toUpperCase()
      if (colIdx.nombre >= 0 && row[colIdx.nombre]) nombre = row[colIdx.nombre]
      if (colIdx.uptimeMensual >= 0 && row[colIdx.uptimeMensual]) uptimeMensual = parseUptimePercentage(row[colIdx.uptimeMensual])
      if (colIdx.uptimeAnual >= 0 && row[colIdx.uptimeAnual]) {
        uptimeAnual = parseUptimePercentage(row[colIdx.uptimeAnual])
      } else {
        uptimeAnual = uptimeMensual
      }
    } else {
      // Positional parsing
      // Check if first col is a row number (e.g. 1, 2, 3...)
      let startOffset = 0
      if (!isNaN(Number(row[0])) && row.length >= 4) {
        startOffset = 1
      }

      const effectiveCols = row.slice(startOffset)
      if (effectiveCols.length >= 3) {
        departamento = effectiveCols[0]?.toUpperCase() || 'NACIONAL'
        nombre = effectiveCols[1] || ''
        uptimeMensual = parseUptimePercentage(effectiveCols[2])
        uptimeAnual = effectiveCols[3] ? parseUptimePercentage(effectiveCols[3]) : uptimeMensual
      } else if (effectiveCols.length === 2) {
        nombre = effectiveCols[0] || ''
        uptimeMensual = parseUptimePercentage(effectiveCols[1])
        uptimeAnual = uptimeMensual
      }
    }

    if (!nombre && !departamento) continue

    records.push({
      id: `net_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
      creadoEn: new Date().toISOString(),
      fecha,
      enlace,
      departamento,
      nombre,
      uptimeMensual,
      uptimeAnual
    })
  }

  return { records }
}
