import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  ImageRun,
  PageNumber,
  PageBreak,
  VerticalAlign,
  UnderlineType
} from 'docx'
import { saveAs } from 'file-saver'
import type { ConsolidatedReportV2, SystemMonthlyMetricsV2 } from '../types/uptime'
import type { OfficialReportMetadata } from './reportFormatters'
import { formatDateLongSpanish, formatTimeTo12Hour } from './reportFormatters'

// Fixed exact widths in DXA (1/20 of a point) for A4 page with 1100 dxa margins
// Printable width: 11906 - 2200 = 9706 -> 9700 dxa
const TOTAL_TABLE_WIDTH = 9700

const BLACK_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const CELL_BORDERS = {
  top: BLACK_BORDER,
  bottom: BLACK_BORDER,
  left: BLACK_BORDER,
  right: BLACK_BORDER
}

const CELL_MARGINS = {
  top: 40,
  bottom: 40,
  left: 80,
  right: 80
}

const NO_BORDER = { style: BorderStyle.NONE }
const BORDERLESS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER
}

const HEADER_SHADING = { fill: 'E2E6E3' }

// System Table Column Widths: 2200 + 1300 + 1300 + 1300 + 1300 + 2300 = 9700 dxa
const SYS_COL_WIDTHS = [2200, 1300, 1300, 1300, 1300, 2300]

// Consolidated Table Column Widths: 2200 + 1500 + 1500 + 1500 + 1500 + 1500 = 9700 dxa
const CONS_COL_WIDTHS = [2200, 1500, 1500, 1500, 1500, 1500]

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const resp = await fetch(url)
  const arrayBuffer = await resp.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

function getSystemMetrics(report: ConsolidatedReportV2, systemName: string): SystemMonthlyMetricsV2 {
  const target = systemName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const found = report.systems.find(
    s => s.sistema.toLowerCase().replace(/[^a-z0-9]/g, '') === target
  )
  if (found) return found

  return {
    sistema: systemName,
    events: [],
    hasEvents: false,
    totalDowntimeSeconds: 0,
    totalDowntimeMinutes: 0,
    totalDowntimeFormatted: '00:00:00',
    downtimePercent: 0,
    downtimePercentFormatted: '0,0000%',
    uptimePercent: 100,
    uptimePercentFormatted: '100,0000%',
    totalPercentFormatted: '100,0000%',
    declaredCount: 0,
    undeclaredCount: 0,
    indicators: {
      proveedor: { label: 'Proveedor', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' },
      programada: { label: 'Programada', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' },
      fallas: { label: 'Fallas', seconds: 0, minutes: 0, formattedTime: '00:00', percent: 0, formattedPercent: '0,0000%' }
    }
  }
}

function createWordSystemTable(metrics: SystemMonthlyMetricsV2, title: string, innerHeaderName?: string): (Paragraph | Table)[] {
  const tableTitle = innerHeaderName || (title === 'T24' ? 'CORE T24' : title || metrics.sistema)

  const titleParagraph = new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [
      new TextRun({
        text: title || metrics.sistema,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
        size: 19 // 9.5pt
      })
    ]
  })

  const rows: TableRow[] = [
    // Header 1: Merged System Name
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          columnSpan: 6,
          width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: tableTitle,
                  bold: true,
                  size: 18 // 9pt
                })
              ]
            })
          ]
        })
      ]
    }),

    // Header 2: Column Titles
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: SYS_COL_WIDTHS[0], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'FECHA', bold: true, size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[1], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'HORA DE INICIO', bold: true, size: 14 }),
                new TextRun({ text: 'DE LA CAIDA', bold: true, size: 14, break: 1 })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[2], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'HORA DE FIN', bold: true, size: 14 }),
                new TextRun({ text: 'DE LA CAIDA', bold: true, size: 14, break: 1 })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'TIEMPO DEL', bold: true, size: 14 }),
                new TextRun({ text: 'SERVICIO ABAJO', bold: true, size: 14, break: 1 })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'INDICADORES', bold: true, size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[5], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: HEADER_SHADING,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'MOTIVO', bold: true, size: 16 })]
            })
          ]
        })
      ]
    })
  ]

  // Data rows
  if (metrics.events.length > 0) {
    for (const e of metrics.events) {
      rows.push(
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: SYS_COL_WIDTHS[0], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: formatDateLongSpanish(e.fecha), size: 16 })]
                })
              ]
            }),
            new TableCell({
              width: { size: SYS_COL_WIDTHS[1], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: formatTimeTo12Hour(e.horaInicio), size: 16 })]
                })
              ]
            }),
            new TableCell({
              width: { size: SYS_COL_WIDTHS[2], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: formatTimeTo12Hour(e.horaFin), size: 16 })]
                })
              ]
            }),
            new TableCell({
              width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: e.tiempoServicioAbajo || '00:00:00', size: 16 })]
                })
              ]
            }),
            new TableCell({
              width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: e.indicador, size: 16 })]
                })
              ]
            }),
            new TableCell({
              width: { size: SYS_COL_WIDTHS[5], type: WidthType.DXA },
              borders: CELL_BORDERS,
              margins: CELL_MARGINS,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: e.motivo || '', size: 16 })]
                })
              ]
            })
          ]
        })
      )
    }
  } else {
    // Empty row
    rows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ width: { size: SYS_COL_WIDTHS[0], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
          new TableCell({ width: { size: SYS_COL_WIDTHS[1], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
          new TableCell({ width: { size: SYS_COL_WIDTHS[2], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
          new TableCell({ width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
          new TableCell({ width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
          new TableCell({ width: { size: SYS_COL_WIDTHS[5], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] })
        ]
      })
    )
  }

  // Totals Block: Row 1 Total Downtime
  // Col 1-3 merged width = 2200 + 1300 + 1300 = 4800 dxa
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          columnSpan: 3,
          width: { size: 4800, type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'Total Downtime en horas', bold: true, size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: metrics.totalDowntimeFormatted, bold: true, size: 16 })]
            })
          ]
        }),
        new TableCell({ width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] }),
        new TableCell({ width: { size: SYS_COL_WIDTHS[5], type: WidthType.DXA }, borders: CELL_BORDERS, margins: CELL_MARGINS, children: [new Paragraph('')] })
      ]
    })
  )

  // Totals Block: Row 2 (% DOWNTIME)
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          columnSpan: 3,
          rowSpan: 3,
          width: { size: 4800, type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [new Paragraph('')]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '% DOWNTIME', bold: true, size: 15 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: metrics.downtimePercentFormatted, bold: true, size: 15 })]
            })
          ]
        }),
        new TableCell({
          rowSpan: 3,
          width: { size: SYS_COL_WIDTHS[5], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [new Paragraph('')]
        })
      ]
    })
  )

  // Totals Block: Row 3 (% UPTIME)
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '% UPTIME', bold: true, size: 15 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: metrics.uptimePercentFormatted, bold: true, size: 15 })]
            })
          ]
        })
      ]
    })
  )

  // Totals Block: Row 4 (% TOTAL)
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: SYS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '% TOTAL', bold: true, size: 15 })]
            })
          ]
        }),
        new TableCell({
          width: { size: SYS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: metrics.totalPercentFormatted, bold: true, size: 15 })]
            })
          ]
        })
      ]
    })
  )

  const table = new Table({
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: SYS_COL_WIDTHS,
    rows
  })

  return [titleParagraph, table]
}

function createWordConsolidatedTable(report: ConsolidatedReportV2, systemsOrder: string[]): (Paragraph | Table)[] {
  const titleParagraph = new Paragraph({
    spacing: { before: 100, after: 80 },
    children: [
      new TextRun({
        text: 'Resumen Final de UPTIME de Sistemas Críticos del BMSC',
        bold: true,
        size: 20
      })
    ]
  })

  const rows: TableRow[] = [
    // Header: black background, white bold text
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: CONS_COL_WIDTHS[0], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'SISTEMA', bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[1], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.monthName.toUpperCase(), bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[2], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'IIBI-PROVEEDOR', bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'IIBI-PROGRAMADA', bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'IIBI-FALLAS', bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[5], type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading: { fill: '000000' },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'TOTAL', bold: true, color: 'FFFFFF', size: 16 })]
            })
          ]
        })
      ]
    })
  ]

  // Data rows for 9 systems
  for (const sysName of systemsOrder) {
    const m = getSystemMetrics(report, sysName)
    rows.push(
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: CONS_COL_WIDTHS[0], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: sysName, bold: true, size: 16 })]
              })
            ]
          }),
          new TableCell({
            width: { size: CONS_COL_WIDTHS[1], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.uptimePercentFormatted, size: 16 })]
              })
            ]
          }),
          new TableCell({
            width: { size: CONS_COL_WIDTHS[2], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.indicators.proveedor.formattedPercent, size: 16 })]
              })
            ]
          }),
          new TableCell({
            width: { size: CONS_COL_WIDTHS[3], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.indicators.programada.formattedPercent, size: 16 })]
              })
            ]
          }),
          new TableCell({
            width: { size: CONS_COL_WIDTHS[4], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.indicators.fallas.formattedPercent, size: 16 })]
              })
            ]
          }),
          new TableCell({
            width: { size: CONS_COL_WIDTHS[5], type: WidthType.DXA },
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: m.downtimePercentFormatted, bold: true, size: 16 })]
              })
            ]
          })
        ]
      })
    )
  }

  // PROMEDIO FINAL row
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: CONS_COL_WIDTHS[0], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: 'PROMEDIO FINAL', bold: true, size: 17 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[1], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.summary.averageUptimeFormatted, bold: true, size: 17 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[2], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.summary.averageProveedorFormatted, bold: true, size: 17 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[3], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.summary.averageProgramadaFormatted, bold: true, size: 17 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[4], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.summary.averageFallasFormatted, bold: true, size: 17 })]
            })
          ]
        }),
        new TableCell({
          width: { size: CONS_COL_WIDTHS[5], type: WidthType.DXA },
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: report.summary.averageTotalDowntimeFormatted, bold: true, size: 17 })]
            })
          ]
        })
      ]
    })
  )

  const table = new Table({
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: CONS_COL_WIDTHS,
    rows
  })

  return [titleParagraph, table]
}

export async function exportOfficialReportToWord(
  report: ConsolidatedReportV2,
  metadata: OfficialReportMetadata,
  year: number
): Promise<void> {
  const [headerImg, footerImg] = await Promise.all([
    fetchImageBytes('/bmsc-header-banner.png'),
    fetchImageBytes('/bmsc-footer-qr.png')
  ])

  const officialSystemsOrder = [
    'CORE T24',
    'FISA',
    'ICBANKING',
    'BANCA MOVIL',
    'PORTAL WEB',
    'POSTILION',
    'ACH',
    'ONBASE',
    'SWIFT'
  ]

  // Memo table widths: 1200 + 8500 = 9700 dxa
  const memoTable = new Table({
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [1200, 8500],
    borders: BORDERLESS,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: 'A:', bold: true, size: 20 })] })]
          }),
          new TableCell({
            width: { size: 8500, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [
              new Paragraph({
                spacing: { after: 20 },
                children: [new TextRun({ text: metadata.destinatarioNombre, bold: true, size: 20 })]
              }),
              new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: metadata.destinatarioCargo, bold: true, size: 20 })]
              })
            ]
          })
        ]
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: 'DE:', bold: true, size: 20 })] })]
          }),
          new TableCell({
            width: { size: 8500, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [
              new Paragraph({
                spacing: { after: 20 },
                children: [new TextRun({ text: metadata.remitenteNombre, bold: true, size: 20 })]
              }),
              new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: metadata.remitenteCargo, bold: true, size: 20 })]
              })
            ]
          })
        ]
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: 'FECHA:', bold: true, size: 20 })] })]
          }),
          new TableCell({
            width: { size: 8500, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: metadata.fechaEmision, bold: true, size: 20 })]
              })
            ]
          })
        ]
      }),
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: 'REF:', bold: true, size: 20 })] })]
          }),
          new TableCell({
            width: { size: 8500, type: WidthType.DXA },
            borders: BORDERLESS,
            margins: { top: 30, bottom: 30, left: 0, right: 0 },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: metadata.referencia, bold: true, size: 20 })]
              })
            ]
          })
        ]
      })
    ]
  })

  const docChildren = [
    // --- PAGE 1 ---
    // Centered Memorandum Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({ text: 'INFORME', bold: true, size: 22 })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 180 },
      children: [
        new TextRun({ text: metadata.informeCode, bold: true, size: 22 })
      ]
    }),

    // Memorandum Grid (A, DE, FECHA, REF) with fixed DXA widths
    memoTable,

    // Solid Horizontal Black Divider Line
    new Paragraph({
      spacing: { before: 80, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' }
      }
    }),

    // Introductory paragraph
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 140 },
      children: [
        new TextRun({ text: metadata.redaccion, size: 20 })
      ]
    }),

    // Tables Page 1: CORE T24, FISA, ICBANKING
    ...createWordSystemTable(getSystemMetrics(report, 'CORE T24'), 'T24', 'CORE T24'),
    ...createWordSystemTable(getSystemMetrics(report, 'FISA'), 'FISA'),
    ...createWordSystemTable(getSystemMetrics(report, 'ICBANKING'), 'ICBANKING'),

    // --- PAGE BREAK -> PAGE 2 ---
    new Paragraph({ children: [new PageBreak()] }),

    // Tables Page 2: PORTAL WEB, BANCA MOVIL, ACH
    ...createWordSystemTable(getSystemMetrics(report, 'PORTAL WEB'), 'PORTAL WEB'),
    ...createWordSystemTable(getSystemMetrics(report, 'BANCA MOVIL'), 'BANCA MOVIL'),
    ...createWordSystemTable(getSystemMetrics(report, 'ACH'), 'ACH'),

    // --- PAGE BREAK -> PAGE 3 ---
    new Paragraph({ children: [new PageBreak()] }),

    // Tables Page 3: POSTILION, ONBASE, SWIFT
    ...createWordSystemTable(getSystemMetrics(report, 'POSTILION'), 'POSTILION'),
    ...createWordSystemTable(getSystemMetrics(report, 'ONBASE'), 'ONBASE'),
    ...createWordSystemTable(getSystemMetrics(report, 'SWIFT'), 'SWIFT'),

    // --- PAGE BREAK -> PAGE 4 ---
    new Paragraph({ children: [new PageBreak()] }),

    // Consolidated Table Page 4
    ...createWordConsolidatedTable(report, officialSystemsOrder),

    // Sign-off Block
    new Paragraph({
      spacing: { before: 240, after: 60 },
      children: [new TextRun({ text: 'Es todo cuanto tengo a bien informar.', size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 40, after: 500 }, // space for signature
      children: [new TextRun({ text: 'Atentamente,', size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 60, after: 20 },
      children: [new TextRun({ text: metadata.remitenteNombre, bold: true, size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 20 },
      children: [new TextRun({ text: metadata.remitenteCargo, bold: true, size: 20 })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: 'Banco Mercantil Santa Cruz S.A.', size: 18, color: '444444' })]
    })
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 18
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1100,
              right: 1100
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 80 },
                children: [
                  new ImageRun({
                    data: headerImg,
                    transformation: { width: 165, height: 50 },
                    type: 'png'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
                columnWidths: [8200, 1500],
                borders: BORDERLESS,
                rows: [
                  new TableRow({
                    cantSplit: true,
                    children: [
                      new TableCell({
                        width: { size: 8200, type: WidthType.DXA },
                        borders: BORDERLESS,
                        children: [
                          new Paragraph({
                            children: [
                              new ImageRun({
                                data: footerImg,
                                transformation: { width: 270, height: 61 },
                                type: 'png'
                              })
                            ]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: 1500, type: WidthType.DXA },
                        verticalAlign: VerticalAlign.BOTTOM,
                        borders: BORDERLESS,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                children: [PageNumber.CURRENT],
                                bold: true,
                                size: 20
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const cleanCode = metadata.informeCode.replace(/[\/\\:]/g, '.')
  const filename = `${cleanCode}_Informe UPTIME_${report.monthName}_${year}.docx`
  saveAs(blob, filename)
}
