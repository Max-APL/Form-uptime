import ExcelJS from 'exceljs'

const data = [
  {
    "SISTEMA": "CORE T24",
    "FECHA": "jueves, 18 de junio de 2026",
    "HORA DE INICIO CAIDA": "10:25:00 a. m.",
    "HORA DE FIN CAIDA": "11:06:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:41:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Problemas en inicios de sesión de usuarios, por bloqueo en tabla de registro de sesiones."
  },
  {
    "SISTEMA": "ICBANKING",
    "FECHA": "martes, 9 de junio de 2026",
    "HORA DE INICIO CAIDA": "03:15:00 a. m.",
    "HORA DE FIN CAIDA": "03:46:00 a. m.",
    "TIEMPO SERVICIO ABAJO": "00:31:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Error de comunicación con base de datos por timeout en pool de conexiones."
  },
  {
    "SISTEMA": "BANCA MOVIL",
    "FECHA": "viernes, 12 de junio de 2026",
    "HORA DE INICIO CAIDA": "14:20:00",
    "HORA DE FIN CAIDA": "15:13:00",
    "TIEMPO SERVICIO ABAJO": "00:53:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Lentitud y desconexión en microservicio de autenticación biométrica."
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "miércoles, 3 de junio de 2026",
    "HORA DE INICIO CAIDA": "01:00:00",
    "HORA DE FIN CAIDA": "01:58:00",
    "TIEMPO SERVICIO ABAJO": "00:58:00",
    "INDICADOR": "II-PROGRAMADA",
    "MOTIVO": "Actualización y parche mensual de seguridad en pasarela ACH."
  },
  {
    "SISTEMA": "ACH",
    "FECHA": "lunes, 22 de junio de 2026",
    "HORA DE INICIO CAIDA": "09:10:00",
    "HORA DE FIN CAIDA": "09:21:00",
    "TIEMPO SERVICIO ABAJO": "00:11:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Reinicio no programado de cola MQ de transacciones ACH."
  },
  {
    "SISTEMA": "SWIFT",
    "FECHA": "sábado, 27 de junio de 2026",
    "HORA DE INICIO CAIDA": "18:00:00",
    "HORA DE FIN CAIDA": "18:45:00",
    "TIEMPO SERVICIO ABAJO": "00:45:00",
    "INDICADOR": "II-FALLAS",
    "MOTIVO": "Falla en enlace de contingencia Alliance Lite2."
  }
]

async function generateSample() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("Eventos")
  ws.columns = [
    { header: 'SISTEMA', key: 'SISTEMA' },
    { header: 'FECHA', key: 'FECHA' },
    { header: 'HORA DE INICIO CAIDA', key: 'HORA DE INICIO CAIDA' },
    { header: 'HORA DE FIN CAIDA', key: 'HORA DE FIN CAIDA' },
    { header: 'TIEMPO SERVICIO ABAJO', key: 'TIEMPO SERVICIO ABAJO' },
    { header: 'INDICADOR', key: 'INDICADOR' },
    { header: 'MOTIVO', key: 'MOTIVO' }
  ]
  data.forEach(row => ws.addRow(row))
  await wb.xlsx.writeFile("ejemplo_incidentes_junio_2026.xlsx")
  console.log("Archivo ejemplo_incidentes_junio_2026.xlsx generado exitosamente en la raíz.")
}

generateSample()
