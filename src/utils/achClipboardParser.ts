import type { AchStatisticRecord } from '../types/achStatistics'
import { parseAchAmount, parseAchQuantity } from '../types/achStatistics'

function cleanCell(val: string | undefined): string {
  if (!val) return ''
  return val.trim().replace(/^["']|["']$/g, '')
}

export function parsePastedAchText(
  text: string,
  referenceDate?: string
): { records: AchStatisticRecord[]; warning?: string } {
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

  const headerCandidates = [
    'tipo', 'cantidad', 'monto', 'mld', 'fecha', 'revision', 'revisado', 'importe', 'trx'
  ]
  const firstRowLower = rows[0].map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const hasHeader = firstRowLower.some(h => headerCandidates.some(c => h.includes(c)))

  const dataRows = hasHeader ? rows.slice(1) : rows
  const records: AchStatisticRecord[] = []

  let colIdx = {
    fecha: -1,
    tipo: -1,
    cantidad: -1,
    monto: -1,
    tipoMld: -1,
    cantidadMld: -1,
    montoMld: -1,
    revision: -1
  }

  if (hasHeader) {
    // Specific match for MLD columns first to avoid collision with standard tipo/cantidad/monto
    colIdx.tipoMld = firstRowLower.findIndex(h => h.includes('tipomld') || h.includes('mldtipo') || (h.includes('mld') && (h.includes('tipo') || h.includes('desc'))))
    colIdx.cantidadMld = firstRowLower.findIndex(h => h.includes('cantidadmld') || h.includes('cantmld') || (h.includes('mld') && (h.includes('cant') || h.includes('num'))))
    colIdx.montoMld = firstRowLower.findIndex(h => h.includes('montomld') || h.includes('importemld') || (h.includes('mld') && (h.includes('monto') || h.includes('imp') || h.includes('val'))))

    colIdx.fecha = firstRowLower.findIndex(h => h.includes('fecha') || h.includes('date') || h.includes('dia'))
    
    // Standard columns excluding the MLD indices
    colIdx.tipo = firstRowLower.findIndex((h, idx) => idx !== colIdx.tipoMld && (h.includes('tipo') || h.includes('concepto') || h.includes('operacion') || h.includes('descripcion')))
    colIdx.cantidad = firstRowLower.findIndex((h, idx) => idx !== colIdx.cantidadMld && (h.includes('cantidad') || h.includes('cant') || h.includes('num') || h.includes('trx')))
    colIdx.monto = firstRowLower.findIndex((h, idx) => idx !== colIdx.montoMld && (h.includes('monto') || h.includes('importe') || h.includes('valor') || h.includes('bs')))
    colIdx.revision = firstRowLower.findIndex(h => h.includes('revision') || h.includes('revisado') || h.includes('rev'))
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (row.length === 0 || (row.length === 1 && !row[0])) continue

    let fecha = todayStr
    let tipo = 'TRANSFERENCIA ENTRANTE'
    let cantidad = 0
    let monto = 0
    let tipoMld = ''
    let cantidadMld = 0
    let montoMld = 0
    let revision = 0

    if (hasHeader) {
      if (colIdx.fecha >= 0 && row[colIdx.fecha]) fecha = row[colIdx.fecha].trim()
      if (colIdx.tipo >= 0 && row[colIdx.tipo]) tipo = row[colIdx.tipo].trim().toUpperCase()
      if (colIdx.cantidad >= 0 && row[colIdx.cantidad]) cantidad = parseAchQuantity(row[colIdx.cantidad])
      if (colIdx.monto >= 0 && row[colIdx.monto]) monto = parseAchAmount(row[colIdx.monto])
      
      if (colIdx.tipoMld >= 0 && row[colIdx.tipoMld]) tipoMld = row[colIdx.tipoMld].trim().toUpperCase()
      if (colIdx.cantidadMld >= 0 && row[colIdx.cantidadMld]) cantidadMld = parseAchQuantity(row[colIdx.cantidadMld])
      if (colIdx.montoMld >= 0 && row[colIdx.montoMld]) montoMld = parseAchAmount(row[colIdx.montoMld])
      
      if (colIdx.revision >= 0 && row[colIdx.revision]) {
        const valRev = row[colIdx.revision].trim().toLowerCase()
        revision = (valRev === '1' || valRev === 'si' || valRev === 'sí' || valRev === 'true' || valRev === 'revisado') ? 1 : 0
      }
    } else {
      // Positional heuristic
      let startOffset = 0
      // Check if first col is index 1, 2, 3...
      if (!isNaN(Number(row[0])) && row.length >= 5) {
        startOffset = 1
      }

      const eff = row.slice(startOffset)
      if (eff.length >= 7) {
        // [fecha, tipo, cantidad, monto, tipoMld, cantidadMld, montoMld, (revision)]
        if (eff[0] && (eff[0].includes('-') || eff[0].includes('/'))) {
          fecha = eff[0].trim()
          tipo = eff[1]?.trim().toUpperCase() || 'TRANSFERENCIA ENTRANTE'
          cantidad = parseAchQuantity(eff[2])
          monto = parseAchAmount(eff[3])
          tipoMld = eff[4]?.trim().toUpperCase() || ''
          cantidadMld = parseAchQuantity(eff[5])
          montoMld = parseAchAmount(eff[6])
          if (eff[7]) {
            const valRev = eff[7].trim().toLowerCase()
            revision = (valRev === '1' || valRev === 'si' || valRev === 'sí' || valRev === 'true' || valRev === 'revisado') ? 1 : 0
          }
        } else {
          // [tipo, cantidad, monto, tipoMld, cantidadMld, montoMld, revision]
          tipo = eff[0]?.trim().toUpperCase() || 'TRANSFERENCIA ENTRANTE'
          cantidad = parseAchQuantity(eff[1])
          monto = parseAchAmount(eff[2])
          tipoMld = eff[3]?.trim().toUpperCase() || ''
          cantidadMld = parseAchQuantity(eff[4])
          montoMld = parseAchAmount(eff[5])
          const valRev = (eff[6] || '').trim().toLowerCase()
          revision = (valRev === '1' || valRev === 'si' || valRev === 'sí' || valRev === 'true' || valRev === 'revisado') ? 1 : 0
        }
      } else if (eff.length >= 6) {
        // [tipo, cantidad, monto, tipoMld, cantidadMld, montoMld]
        tipo = eff[0]?.trim().toUpperCase() || 'TRANSFERENCIA ENTRANTE'
        cantidad = parseAchQuantity(eff[1])
        monto = parseAchAmount(eff[2])
        tipoMld = eff[3]?.trim().toUpperCase() || ''
        cantidadMld = parseAchQuantity(eff[4])
        montoMld = parseAchAmount(eff[5])
      } else if (eff.length >= 3) {
        // [tipo, cantidad, monto]
        tipo = eff[0]?.trim().toUpperCase() || 'TRANSFERENCIA ENTRANTE'
        cantidad = parseAchQuantity(eff[1])
        monto = parseAchAmount(eff[2])
      }
    }

    // Filter out example rows
    if (
      tipo.includes('(EJEMPLO)') ||
      tipo.includes('EJEMPLO') ||
      tipoMld.includes('(EJEMPLO)') ||
      tipoMld.includes('EJEMPLO')
    ) {
      continue
    }

    if (!tipo && cantidad === 0 && monto === 0 && cantidadMld === 0 && montoMld === 0) continue

    records.push({
      id: `ach_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      creadoEn: new Date().toISOString(),
      fecha,
      tipo,
      cantidad,
      monto,
      tipoMld,
      cantidadMld,
      montoMld,
      revision
    })
  }

  return { records }
}
