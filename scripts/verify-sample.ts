import fs from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import { calculateUptimeMetrics } from '../src/utils/calculator'
import { generateUptimeWorkbook } from '../src/utils/excelGenerator'
import { SAMPLE_JUNE_EVENTS } from '../src/utils/sampleData'

async function runVerification() {
  console.log('--- Iniciando Verificación de Uptime & Generación de Excel ---')
  const report = calculateUptimeMetrics(SAMPLE_JUNE_EVENTS, 2026, 6)

  console.log(`Mes: ${report.monthName} ${report.year}`)
  console.log(`Días en el mes: ${report.daysInMonth}`)
  console.log(`Horas totales evaluadas: ${report.totalMonthHours} hrs`)
  console.log(`Disponibilidad Promedio: ${report.summary.averageUptimeFormatted}`)
  console.log(`Total Indisponibilidad: ${report.summary.totalDowntimeFormatted}`)

  console.log('\nSistemas evaluados:')
  for (const sys of report.systems) {
    console.log(`  - ${sys.sistema.padEnd(16)} | Uptime: ${sys.uptimePercentFormatted} | Downtime: ${sys.downtimePercentFormatted} | Eventos: ${sys.events.length}`)
  }

  const blob = await generateUptimeWorkbook(report)
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const outPath = path.join(__dirname, '../dist/Reporte_Disponibilidad_BMSC_JUNIO_2026.xlsx')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, buffer)
  console.log(`\nArchivo Excel generado con éxito en: ${outPath} (${buffer.length} bytes)`)

  // Verify created workbook
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(outPath)
  console.log(`Hojas creadas (${wb.worksheets.length}): ${wb.worksheets.map(w => w.name).join(', ')}`)
  console.log('--- Verificación completada con éxito ---')
}

runVerification().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
