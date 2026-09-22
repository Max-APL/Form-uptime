import type { EventRecordV2 } from '../types/uptime'
import {
  calculateDurationFromTimes,
  formatSecondsToHHMMSS,
  normalizeIndicator,
  parseDurationToSeconds
} from './calculator'

function cleanCell(val: string | undefined): string {
  if (!val) return ''
  return val.trim().replace(/^["']|["']$/g, '')
}

export function parsePastedTableText(text: string): { records: EventRecordV2[]; warning?: string } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return { records: [], warning: 'El portapapeles no contiene texto válido.' }
  }

  const firstLine = lines[0]
  const isTabDelimited = firstLine.includes('\t')
  const delimiter = isTabDelimited ? '\t' : firstLine.includes(';') ? ';' : ','

  const rows = lines.map(line => line.split(delimiter).map(cleanCell))
  if (rows.length === 0) {
    return { records: [] }
  }

  const headerCandidates = ['sistema', 'fecha', 'inicio', 'fin', 'indicador', 'motivo', 'componente', 'responsable']
  const firstRowLower = rows[0].map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const hasHeader = firstRowLower.some(h => headerCandidates.some(c => h.includes(c)))

  const dataRows = hasHeader ? rows.slice(1) : rows
  const records: EventRecordV2[] = []

  let colIdx = {
    sistema: -1,
    componente: -1,
    fecha: -1,
    inicio: -1,
    fin: -1,
    duracion: -1,
    indicador: -1,
    responsable: -1,
    origen: -1,
    declarado: -1,
    revision: -1,
    bitacora: -1,
    motivo: -1,
    solucion: -1
  }

  if (hasHeader) {
    const findIdx = (keywords: string[]) => {
      return firstRowLower.findIndex(h => keywords.some(k => h.includes(k)))
    }
    colIdx.sistema = findIdx(['sistema', 'system', 'servicio'])
    colIdx.componente = findIdx(['componente', 'modulo', 'servicio'])
    colIdx.fecha = findIdx(['fecha', 'date', 'dia'])
    colIdx.inicio = findIdx(['iniciocaida', 'horainicio', 'inicio'])
    colIdx.fin = findIdx(['fincaida', 'horafin', 'fin'])
    colIdx.duracion = findIdx(['tiemposervicioabajo', 'duracion', 'tiempoabajo'])
    colIdx.indicador = findIdx(['indicador', 'tipo', 'tipodefalla', 'categoria'])
    colIdx.responsable = findIdx(['responsable', 'asignado', 'encargado'])
    colIdx.origen = findIdx(['origen', 'fuente', 'canal'])
    colIdx.declarado = findIdx(['declarado', 'oficial', 'notificado'])
    colIdx.revision = findIdx(['revision', 'revisado', 'rev'])
    colIdx.bitacora = findIdx(['bitacora', 'hecho', 'registro', 'correo', 'mensaje', 'minuta', 'ticket', 'caso', 'id'])
    colIdx.motivo = findIdx(['motivo', 'descripcion', 'causa'])
    colIdx.solucion = findIdx(['solucion', 'resolucion', 'accion'])
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (row.length === 0 || row.every(c => !c)) continue

    const getVal = (idx: number, fallbackIdx: number) => {
      if (idx >= 0 && idx < row.length) return row[idx]
      if (fallbackIdx >= 0 && fallbackIdx < row.length) return row[fallbackIdx]
      return ''
    }

    const sistema = getVal(colIdx.sistema, 0) || 'SISTEMA NO ESPECIFICADO'
    const componente = getVal(colIdx.componente, 1)
    const fecha = getVal(colIdx.fecha, 2) || new Date().toISOString().split('T')[0]
    const inicio = getVal(colIdx.inicio, 3)
    const fin = getVal(colIdx.fin, 4)
    const duracionRaw = getVal(colIdx.duracion, 5)
    const indicador = normalizeIndicator(getVal(colIdx.indicador, 6))
    const responsable = getVal(colIdx.responsable, 7)
    const origen = getVal(colIdx.origen, 8)
    const declaradoRaw = getVal(colIdx.declarado, 9).toLowerCase()
    const declarado = ['si', 'sí', 'true', '1', 'yes', 'declarado'].includes(declaradoRaw)
    const revisionRaw = getVal(colIdx.revision, -1).toLowerCase()
    const revision = ['si', 'sí', 'true', '1', 'yes', 'revisado', 'revision'].includes(revisionRaw)
    const bitacora = getVal(colIdx.bitacora, 10)
    const motivo = getVal(colIdx.motivo, 11)
    const solucion = getVal(colIdx.solucion, 12)

    let sec = parseDurationToSeconds(duracionRaw)
    if (sec <= 0 && inicio && fin) {
      sec = calculateDurationFromTimes(inicio, fin)
    }

    const formattedDuration = formatSecondsToHHMMSS(sec)

    records.push({
      id: `pasted-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      sistema,
      componente,
      fecha,
      horaInicio: inicio,
      horaFin: fin,
      tiempoServicioAbajo: formattedDuration,
      durationMinutes: Math.round((sec / 60) * 100) / 100,
      durationSeconds: sec,
      indicador,
      responsable,
      origen,
      declarado,
      revision,
      bitacora,
      motivo,
      solucion,
      createdAt: new Date().toISOString()
    })
  }

  return { records }
}
