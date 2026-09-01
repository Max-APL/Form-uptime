import ExcelJS from 'exceljs'

const marzoEvents = [
  {
    "SISTEMA": "CORE T24",
    "FECHA": "miércoles, 25 de marzo de 2026",
    "HORA DE INICIO CAIDA": "10:31:00 p. m.",
    "HORA DE FIN CAIDA": "11:05:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:34:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Contención BD"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "miércoles, 4 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:12:00 p. m.",
    "HORA DE FIN CAIDA": "1:36:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:24:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "viernes, 6 de marzo de 2026",
    "HORA DE INICIO CAIDA": "5:46:00 p. m.",
    "HORA DE FIN CAIDA": "6:12:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:26:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "lunes, 9 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:55:00 p. m.",
    "HORA DE FIN CAIDA": "2:30:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:35:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ICBANKING",
    "FECHA": "jueves, 19 de marzo de 2026",
    "HORA DE INICIO CAIDA": "9:30:00 a. m.",
    "HORA DE FIN CAIDA": "9:55:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:25:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "miércoles, 4 de marzo de 2026",
    "HORA DE INICIO CAIDA": "1:12:00 p. m.",
    "HORA DE FIN CAIDA": "1:36:00 p. m.",
    "TIEMPO SERVICIO ABAJO": "00:24:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Estabilización nuevo Sistema Core (Ajustes)"
  },
  {
    "SISTEMA": "SWIFT",
    "FECHA": "sábado, 28 de marzo de 2026",
    "HORA DE INICIO CAIDA": "14:00:00",
    "HORA DE FIN CAIDA": "14:30:00",
    "TIEMPO SERVICIO ABAJO": "00:30:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Corte de enlace de comunicación"
  }
]

async function generateMarchSample() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("Eventos Marzo")
  ws.columns = [
    { header: 'SISTEMA', key: 'SISTEMA' },
    { header: 'FECHA', key: 'FECHA' },
    { header: 'HORA DE INICIO CAIDA', key: 'HORA DE INICIO CAIDA' },
    { header: 'HORA DE FIN CAIDA', key: 'HORA DE FIN CAIDA' },
    { header: 'TIEMPO SERVICIO ABAJO', key: 'TIEMPO SERVICIO ABAJO' },
    { header: 'INDICADOR', key: 'INDICADOR' },
    { header: 'MOTIVO', key: 'MOTIVO' }
  ]
  marzoEvents.forEach(row => ws.addRow(row))
  await wb.xlsx.writeFile("eventos_marzo_2026.xlsx")
  console.log("Archivo eventos_marzo_2026.xlsx creado exitosamente en la raíz.")
}

generateMarchSample()
