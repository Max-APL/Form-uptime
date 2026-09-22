import ExcelJS from 'exceljs'
import saveAs from 'file-saver'
import type { ConsolidatedReportV2, EventRecordV2 } from '../types/uptime'
import { getMonthNameSpanish } from './calculator'

export async function exportEventsToExcelV2(
  events: EventRecordV2[],
  report: ConsolidatedReportV2,
  year: number,
  month: number
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BMSC Form Uptime'
  workbook.created = new Date()

  // 1. Sheet: Detalle de Eventos V2
  const wsEvents = workbook.addWorksheet('Eventos Uptime', {
    views: [{ state: 'frozen', ySplit: 2 }]
  })

  // Title row
  wsEvents.mergeCells('A1:M1')
  const titleCell = wsEvents.getCell('A1')
  titleCell.value = `REPORTE DE INCIDENTES Y DOWNTIME — ${getMonthNameSpanish(month)} ${year}`
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsEvents.getRow(1).height = 32

  // Headers
  const headers = [
    'Sistema',
    'Componente',
    'Fecha',
    'Hora Inicio',
    'Hora Fin',
    'Duración',
    'Indicador',
    'Responsable',
    'Origen',
    'Declarado',
    'Revisión',
    'Bitácora / Registro de Hechos',
    'Motivo / Causa',
    'Solución / Acción'
  ]

  const headerRow = wsEvents.addRow(headers)
  headerRow.height = 26
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF38BDF8' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    }
  })

  // Data rows
  events.forEach((ev, idx) => {
    const isEven = idx % 2 === 0
    const row = wsEvents.addRow([
      ev.sistema,
      ev.componente || '—',
      ev.fecha,
      ev.horaInicio,
      ev.horaFin,
      ev.tiempoServicioAbajo,
      ev.indicador,
      ev.responsable || '—',
      ev.origen || '—',
      ev.declarado ? 'SÍ' : 'NO',
      ev.revision ? 'SÍ' : 'NO',
      ev.bitacora || '—',
      ev.motivo,
      ev.solucion || '—'
    ])
    row.height = 22

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10 }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      }

      if ([1, 2, 8, 9].includes(colNum)) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
      } else if ([3, 4, 5, 6, 7, 10, 11, 12].includes(colNum)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      }

      if (colNum === 10) {
        if (ev.declarado) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } }
        } else {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } }
        }
      } else if (colNum === 11) {
        if (ev.revision) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1D4ED8' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }
        } else {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } }
        }
      }
    })
  })

  // Set column widths
  wsEvents.columns = [
    { width: 22 }, // Sistema
    { width: 20 }, // Componente
    { width: 14 }, // Fecha
    { width: 14 }, // Inicio
    { width: 14 }, // Fin
    { width: 14 }, // Duración
    { width: 18 }, // Indicador
    { width: 22 }, // Responsable
    { width: 20 }, // Origen
    { width: 13 }, // Declarado
    { width: 13 }, // Revisión
    { width: 35 }, // Bitácora / Registro de Hechos
    { width: 35 }, // Motivo
    { width: 35 }  // Solución
  ]

  // 2. Sheet: Resumen de Disponibilidad y Métricas
  const wsSummary = workbook.addWorksheet('Resumen Disponibilidad', {
    views: [{ state: 'frozen', ySplit: 2 }]
  })

  wsSummary.mergeCells('A1:G1')
  const sumTitle = wsSummary.getCell('A1')
  sumTitle.value = `DISPONIBILIDAD MENSUAL POR SISTEMA — ${getMonthNameSpanish(month)} ${year}`
  sumTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } }
  sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0369A1' } }
  sumTitle.alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getRow(1).height = 30

  const sumHeaders = [
    'Sistema',
    'Eventos',
    'Declarados',
    'Tiempo Caído',
    'Fallas (%)',
    'Proveedor (%)',
    'Programada (%)',
    'Disponibilidad (%)'
  ]

  const sumHeaderRow = wsSummary.addRow(sumHeaders)
  sumHeaderRow.height = 24
  sumHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF0EA5E9' } }
    }
  })

  report.systems.forEach((sys, i) => {
    const isEven = i % 2 === 0
    const row = wsSummary.addRow([
      sys.sistema,
      sys.events.length,
      sys.declaredCount,
      sys.totalDowntimeFormatted,
      sys.indicators.fallas.formattedPercent,
      sys.indicators.proveedor.formattedPercent,
      sys.indicators.programada.formattedPercent,
      sys.uptimePercentFormatted
    ])
    row.height = 20
    row.eachCell((cell, cIdx) => {
      cell.font = { name: 'Calibri', size: 10 }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
      }
      cell.alignment = {
        horizontal: cIdx === 1 ? 'left' : 'center',
        vertical: 'middle'
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      }
      if (cIdx === 8) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0284C7' } }
      }
    })
  })

  wsSummary.columns = [
    { width: 24 },
    { width: 12 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 20 }
  ]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Reporte_Uptime_${getMonthNameSpanish(month)}_${year}.xlsx`)
}

export const exportEventsToExcel = exportEventsToExcelV2
